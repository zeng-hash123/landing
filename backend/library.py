import os
import json
from typing import List, Dict

def load_component_library(base_path: str) -> List[Dict]:
    """
    Scans subdirectories for .json files and returns a flat list of components.
    """
    library = []
    subdirs = ["hero", "Features", "cta", "pricing", "testimonials"]
    for subdir in subdirs:
        dir_path = os.path.join(base_path, subdir)
        if not os.path.exists(dir_path):
            continue
        for filename in os.listdir(dir_path):
            if filename.endswith(".json"):
                file_path = os.path.join(dir_path, filename)
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        if "metadata" in data:
                            data["metadata"]["section_type"] = data["metadata"].get("section_type", "").lower()
                        data["template_file"] = filename
                        library.append(data)
                except Exception as e:
                    print(f"Error loading {file_path}: {e}")
    return library

def filter_candidates(library: List[Dict], section_type: str, vibe: str, js_allowed: bool = True) -> List[Dict]:
    """
    Filters library components by section_type, mapped vibe tags, and JS dependency.
    """
    vibe_map = {
        'Bold & modern': ['bold', 'modern'],
        'Minimal & clean': ['minimal', 'clean'],
        'Luxury & premium': ['luxury', 'minimal'],
        'Playful & fun': ['playful', 'warm'],
        'Corporate & trustworthy': ['corporate'],
        'Tech & futuristic': ['tech'],
        'Warm & organic': ['warm', 'organic'],
        'Edgy & high-contrast': ['edgy', 'bold']
    }
    target_tags = vibe_map.get(vibe, [vibe.lower()])
    
    candidates = []
    for item in library:
        meta = item.get("metadata", {})
        if meta.get("section_type", "").lower() != section_type.lower():
            if section_type.lower() == "testimonial" and meta.get("section_type", "").lower() == "testimonials":
                pass
            elif section_type.lower() == "testimonials" and meta.get("section_type", "").lower() == "testimonial":
                pass
            elif section_type.lower() == "feature" and meta.get("section_type", "").lower() == "features":
                pass
            elif section_type.lower() == "features" and meta.get("section_type", "").lower() == "feature":
                pass
            else:
                continue
            
        if not js_allowed and meta.get("js_dependency") == "requires_js":
            continue
            
        item_tags = meta.get("vibe_tags", [])
        if not set(target_tags).isdisjoint(set(item_tags)):
            candidates.append({"template_file": item.get("template_file"), "metadata": meta})
            
    return candidates
