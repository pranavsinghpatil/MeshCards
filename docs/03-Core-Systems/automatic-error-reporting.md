# Automatic Error Reporting System

## 🚨 Overview

MeshCards now automatically creates GitHub issues when backend errors occur! This helps track and fix bugs quickly.

## ✅ What Gets Reported

### Automatic Issue Creation For:
- ❌ Deck generation failures
- ❌ JSON parsing errors
- ❌ LLM API errors
- ❌ Authentication failures
- ❌ Quota system errors
- ❌ Any unhandled exceptions

### What's Included in Each Issue:
1. **Error Type** - Exception class name
2. **Error Message** - What went wrong
3. **Full Stack Trace** - Complete traceback
4. **Context** - Where it happened (e.g., "Deck Generation")
5. **Timestamp** - When it occurred (UTC)
6. **Environment** - production/development
7. **User ID** - Anonymized (first 8 chars only)
8. **Request Data** - Sanitized (no API keys/passwords)

## 🔒 Privacy & Security

### Data Sanitization:
All sensitive information is automatically removed:
- ✅ API keys → `***REDACTED***`
- ✅ Passwords → `***REDACTED***`
- ✅ Tokens → `***REDACTED***`
- ✅ Authorization headers → `***REDACTED***`
- ✅ Long strings → Truncated to 100 chars

### User Privacy:
- User IDs are anonymized (only first 8 characters shown)
- No email addresses included
- No personal information exposed

## 📋 Example GitHub Issue

**Title:**
```
[AUTO] ERROR: JSONDecodeError in Deck Generation
```

**Body:**
```markdown
## 🚨 Automatic Error Report

**Severity:** `ERROR`  
**Context:** Deck Generation (Job abc123...)  
**Timestamp:** 2025-12-30T20:15:30 UTC  
**Environment:** production

### Error Details

**Type:** `JSONDecodeError`  
**Message:** Invalid \escape: line 60 column 75 (char 3059)

### Stack Trace

```python
Traceback (most recent call last):
  File "/app/backend/main.py", line 150, in generate_deck_task
    cards = generator.generate_flashcards(text, config)
  ...
```

### Additional Context

**User ID (anonymized):** `abc12345...`

### Action Required

- [ ] Investigate root cause
- [ ] Implement fix
- [ ] Add test case
- [ ] Deploy to production

---
*This issue was automatically created by the error reporting system.*
```

**Labels:**
- `bug`
- `auto-reported`
- `error`
- `llm` (if LLM-related)
- `quota` (if quota-related)
- `authentication` (if auth-related)

## ⚙️ Configuration

### Required Environment Variables:

```env
# GitHub Integration (Same as feedback system)
GITHUB_TOKEN=ghp_your_token_here
GITHUB_REPO=pranavsinghpatil/MeshCards
```

### When It Works:
- ✅ Only in **production** (`ENV=production`)
- ✅ Only if GitHub credentials are set
- ✅ Automatically for all unhandled exceptions

### In Development:
- Logs to console only
- Shows what would be reported
- Doesn't spam GitHub with dev errors

## 🎯 How It Works

### 1. Error Occurs
```python
try:
    cards = generator.generate_flashcards(text, config)
except Exception as e:
    # Error caught!
```

### 2. Error Reporter Called
```python
report_error(
    error=e,
    context="Deck Generation",
    user_id=user.id,
    request_data={"model": "gemini-2.5-flash", ...},
    severity="error"
)
```

### 3. Data Sanitized
- Remove API keys
- Anonymize user ID
- Truncate long strings

### 4. GitHub Issue Created
- POST to GitHub API
- Create issue with formatted body
- Add appropriate labels

### 5. Logged Locally
- Full error in console
- Traceback preserved
- Context included

## 📊 Severity Levels

### `error` (Default)
- Normal errors
- Labels: `bug`, `auto-reported`, `error`

### `critical`
- System-breaking errors
- Payment/billing issues
- Data loss risks
- Labels: `bug`, `auto-reported`, `critical`

### `warning`
- Non-breaking issues
- Performance problems
- Deprecated features
- Labels: `auto-reported`, `warning`

## 🔧 Usage in Code

### Basic Usage:
```python
from backend.core.error_reporter import report_error

try:
    # some code
    result = risky_operation()
except Exception as e:
    report_error(e, "Operation Name")
    raise  # Re-raise to handle normally
```

### With User Context:
```python
try:
    generate_deck(user_id, text)
except Exception as e:
    report_error(
        e, 
        "Deck Generation",
        user_id=user.id
    )
    raise
```

### With Request Data:
```python
try:
    process_request(data)
except Exception as e:
    report_error(
        e,
        "Request Processing",
        user_id=user.id,
        request_data={"model": model, "count": count}
    )
    raise
```

### Critical Errors:
```python
try:
    critical_operation()
except Exception as e:
    report_error(
        e,
        "Critical Operation",
        severity="critical"
    )
    raise
```

## 📈 Benefits

### For Developers:
- ✅ Automatic bug tracking
- ✅ Complete error context
- ✅ Stack traces preserved
- ✅ No manual issue creation
- ✅ Organized with labels

### For Users:
- ✅ Faster bug fixes
- ✅ Better error messages
- ✅ Improved reliability
- ✅ Privacy protected

### For Project:
- ✅ Better error visibility
- ✅ Trend analysis possible
- ✅ Quality improvements
- ✅ Professional error handling

## 🚫 What's NOT Reported

- ✅ Expected errors (validation, quota exceeded)
- ✅ 404 Not Found
- ✅ 401 Unauthorized
- ✅ 429 Rate Limited
- ✅ Development environment errors

## 📝 Managing Issues

### Triage Process:
1. Check severity label
2. Review stack trace
3. Reproduce if possible
4. Assign to developer
5. Fix and test
6. Deploy
7. Close issue

### Preventing Duplicates:
- Search existing issues first
- Group similar errors
- Close duplicates
- Reference related issues

### Best Practices:
- Review issues weekly
- Prioritize by severity
- Track fix time
- Add tests for fixed bugs

## 🔍 Monitoring

### Check Error Rate:
```
GitHub → Issues → Filter by label:auto-reported
```

### Common Patterns:
- Group by error type
- Identify frequent failures
- Track by context
- Monitor severity distribution

### Metrics to Track:
- Total auto-reported issues
- Critical vs error vs warning
- Time to resolution
- Recurring errors

## ✅ Verification

### Test in Development:
```python
# Will log but not create issue
report_error(
    ValueError("Test error"),
    "Test Context",
    severity="error"
)
```

### Test in Production:
1. Deploy with GitHub credentials
2. Trigger an error
3. Check GitHub issues
4. Verify issue created
5. Verify data sanitized

## 🎉 Summary

**Automatic error reporting is now active!**

- ✅ All backend errors tracked
- ✅ GitHub issues created automatically
- ✅ Privacy and security maintained
- ✅ Better debugging information
- ✅ Faster bug fixes

**No manual work required - it just works!** 🚀
