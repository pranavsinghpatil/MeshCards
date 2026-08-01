"""
Automatic Error Reporter - Creates GitHub Issues for Backend Errors
"""
import os
import json
import urllib.request
import traceback
import threading
import time
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from backend.core.logging import logger

class ErrorReporter:
    """Automatically creates GitHub issues for critical backend errors"""
    
    def __init__(self):
        self.github_token = os.getenv("GITHUB_TOKEN")
        self.github_repo = os.getenv("GITHUB_REPO")
        self.enabled = bool(self.github_token and self.github_repo)
        self.env = os.getenv("ENV", "development")
        self._lock = threading.Lock()
        self._report_timestamps = []
        
    def report_error(
        self,
        error: Exception,
        context: str,
        user_id: Optional[str] = None,
        request_data: Optional[Dict[str, Any]] = None,
        severity: str = "error"
    ):
        """
        Report an error by creating a GitHub issue
        
        Args:
            error: The exception that occurred
            context: Where the error occurred (e.g., "Deck Generation", "Auth")
            user_id: Optional user ID (anonymized)
            request_data: Optional request data (sanitized)
            severity: error, warning, or critical
        """
        if not self.enabled:
            logger.warning("Error reporter not enabled - missing GitHub credentials")
            return
            
        # Only report in production to avoid spam
        if self.env != "production":
            logger.info(f"Error reporter: Would report in production: {context} - {str(error)}")
            return
        
        try:
            # Build issue title
            error_type = type(error).__name__
            title = f"[AUTO] {severity.upper()}: {error_type} in {context}"
            
            # Build issue body
            body = self._build_issue_body(error, context, user_id, request_data, severity)
            
            # Create labels
            labels = ["bug", "auto-reported", severity]
            if "quota" in context.lower():
                labels.append("quota")
            if "auth" in context.lower():
                labels.append("authentication")
            if "llm" in context.lower() or "generation" in context.lower():
                labels.append("llm")
            
            # Rate limit check: max 10 issues per hour
            now_ts = time.time()
            with self._lock:
                self._report_timestamps = [ts for ts in self._report_timestamps if now_ts - ts < 3600]
                if len(self._report_timestamps) >= 10:
                    logger.warning("Error reporter rate limit reached (max 10 issues per hour). Skipping GitHub report.")
                    return
                self._report_timestamps.append(now_ts)
            
            # Create the issue asynchronously in a daemon thread so we don't block the event loop
            threading.Thread(
                target=self._create_github_issue,
                args=(title, body, labels),
                daemon=True
            ).start()
            logger.info(f"Error queued for GitHub reporting: {title}")
            
        except Exception as e:
            logger.error(f"Failed to report error to GitHub: {e}")
    
    def _build_issue_body(
        self,
        error: Exception,
        context: str,
        user_id: Optional[str],
        request_data: Optional[Dict[str, Any]],
        severity: str
    ) -> str:
        """Build the GitHub issue body with all relevant information"""
        
        # Get timestamp
        timestamp = datetime.now(timezone.utc).isoformat()
        
        # Get traceback
        tb = ''.join(traceback.format_exception(type(error), error, error.__traceback__))
        
        # Sanitize request data (remove sensitive info)
        safe_request_data = self._sanitize_data(request_data) if request_data else None
        
        # Build markdown body
        body = f"""## 🚨 Automatic Error Report

**Severity:** `{severity.upper()}`  
**Context:** {context}  
**Timestamp:** {timestamp} UTC  
**Environment:** {self.env}

### Error Details

**Type:** `{type(error).__name__}`  
**Message:** {str(error)}

### Stack Trace

```python
{tb}
```

### Additional Context

"""
        
        if user_id:
            # Anonymize user ID (show only first 8 chars)
            anonymized_id = user_id[:8] + "..." if len(user_id) > 8 else user_id
            body += f"**User ID (anonymized):** `{anonymized_id}`\n\n"
        
        if safe_request_data:
            body += f"**Request Data:**\n```json\n{json.dumps(safe_request_data, indent=2)}\n```\n\n"
        
        body += """### Action Required

- [ ] Investigate root cause
- [ ] Implement fix
- [ ] Add test case
- [ ] Deploy to production

---
*This issue was automatically created by the error reporting system.*
"""
        
        return body
    
    def _sanitize_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Remove sensitive information from request data"""
        sensitive_keys = [
            'api_key', 'password', 'token', 'secret', 'authorization',
            'supabase_key', 'gemini_api_key', 'openai_api_key'
        ]
        
        sanitized = {}
        for key, value in data.items():
            # Check if key contains sensitive terms
            if any(sensitive in key.lower() for sensitive in sensitive_keys):
                sanitized[key] = "***REDACTED***"
            elif isinstance(value, dict):
                sanitized[key] = self._sanitize_data(value)
            elif isinstance(value, str) and len(value) > 100:
                # Truncate long strings
                sanitized[key] = value[:100] + "... (truncated)"
            else:
                sanitized[key] = value
        
        return sanitized
    
    def _create_github_issue(self, title: str, body: str, labels: list):
        """Create a GitHub issue via API"""
        url = f"https://api.github.com/repos/{self.github_repo}/issues"
        
        data = {
            "title": title,
            "body": body,
            "labels": labels
        }
        
        req = urllib.request.Request(
            url,
            data=json.dumps(data).encode("utf-8"),
            headers={
                "Authorization": f"token {self.github_token}",
                "Accept": "application/vnd.github.v3+json",
                "User-Agent": "MeshCards-ErrorReporter"
            }
        )
        
        with urllib.request.urlopen(req, timeout=3.0) as response:
            if response.status == 201:
                logger.info("GitHub issue created successfully")
            else:
                logger.warning(f"GitHub issue creation returned status {response.status}")


# Global instance
_error_reporter = None

def get_error_reporter() -> ErrorReporter:
    """Get or create the global error reporter instance"""
    global _error_reporter
    if _error_reporter is None:
        _error_reporter = ErrorReporter()
    return _error_reporter


def report_error(
    error: Exception,
    context: str,
    user_id: Optional[str] = None,
    request_data: Optional[Dict[str, Any]] = None,
    severity: str = "error"
):
    """
    Convenience function to report an error
    
    Usage:
        try:
            # some code
        except Exception as e:
            report_error(e, "Deck Generation", user_id=user.id, severity="critical")
            raise
    """
    reporter = get_error_reporter()
    reporter.report_error(error, context, user_id, request_data, severity)
