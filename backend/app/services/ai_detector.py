import re

AI_FINGERPRINT_PATTERNS = [
    r"as an ai",
    r"chatgpt",
    r"language model",
    r"certainly!",
    r"in summary",
    r"in conclusion",
    r"delving into",
    r"testament to",
    r"tapestry",
    r"fostering a culture",
    r"beacon of",
    r"seamlessly",
    r"let's dive",
    r"as a (passionate|seasoned)? (software|full stack|backend|frontend)? (engineer|developer)",
    r"in the realm of",
    r"navigating the complexities",
    r"pivotal role",
    r"crucial role",
    r"relentless pursuit",
    r"here is a brief overview",
    r"it is worth noting",
    r"it is important to note",
    r"leveraging my skills",
    r"robust and scalable",
    r"meticulously",
    r"in today's (fast-paced|ever-evolving)",
]

def check_ai_generated_content(text: str) -> dict:
    """
    Analyzes input text for LLM/AI-generated markers, robotic phrasing, and un-edited copy-pasted LLM boilerplate.
    Returns dict: { is_ai: bool, confidence: float, reason: str }
    """
    if not text or len(text.strip()) < 10:
        return {"is_ai": False, "confidence": 0.0, "reason": ""}

    text_lower = text.lower()
    
    # 1. Direct AI Fingerprint Markers
    for pattern in AI_FINGERPRINT_PATTERNS:
        match = re.search(pattern, text_lower)
        if match:
            return {
                "is_ai": True,
                "confidence": 98.0,
                "reason": f"Detected AI-generated phrasing: '{match.group(0)}'"
            }

    # 2. Formal Transition Overuse (Count AI-favored transition words)
    ai_transitions = [
        "furthermore", "moreover", "consequently", "nevertheless", 
        "henceforth", "in light of", "it is imperative", "subsequently", "overall,"
    ]
    transition_count = sum(1 for word in ai_transitions if word in text_lower)
    
    # 3. Uniform Sentence Length & Formal Tone Analysis
    sentences = [s.strip() for s in re.split(r'[.!?]', text) if s.strip()]
    
    if len(sentences) >= 3 and transition_count >= 2:
        return {
            "is_ai": True,
            "confidence": 88.0,
            "reason": "Overly formal robotic structure and repeated AI transition phrases detected."
        }

    return {"is_ai": False, "confidence": 0.0, "reason": ""}
