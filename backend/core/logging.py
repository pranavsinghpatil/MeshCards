import logging
import sys

def setup_logging():
    logger = logging.getLogger("meshcards")
    logger.setLevel(logging.INFO)
    
    # Format
    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )
    
    # Console Handler
    ch = logging.StreamHandler(sys.stdout)
    ch.setFormatter(formatter)
    ch.setLevel(logging.INFO)
    
    # Add handler if not exists
    if not logger.handlers:
        logger.addHandler(ch)
        
    return logger

logger = setup_logging()
