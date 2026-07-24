import os
import json
from typing import List, Dict

def load_component_library(base_path: str) -> List[Dict]:
    """
    Scans subdirectories for .json files and returns a flat list of components.
    Handles single-component JSONs, array JSONs (footer_templates.json), multi-variant JSONs (navbar.json),
    and component collection JSONs (forms.json).
    """
    library = []
    subdirs = ["navbar", "hero", "Features", "cta", "pricing", "testimonials", "footer", "forms"]
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
                        if isinstance(data, list):
                            for idx, item in enumerate(data):
                                if isinstance(item, dict) and "metadata" in item:
                                    item["metadata"]["section_type"] = item["metadata"].get("section_type", "").lower()
                                    item["template_file"] = f"{filename}_{item.get('filename', idx)}"
                                    library.append(item)
                        elif isinstance(data, dict) and "components" in data and isinstance(data["components"], list):
                            for idx, item in enumerate(data["components"]):
                                if isinstance(item, dict) and "metadata" in item:
                                    item["metadata"]["section_type"] = item["metadata"].get("section_type", "").lower()
                                    item["template_file"] = f"{filename}_{item.get('filename', idx)}"
                                    library.append(item)
                        elif isinstance(data, dict) and "variants" in data and isinstance(data["variants"], list):
                            for idx, variant in enumerate(data["variants"]):
                                var_item = {
                                    "template_file": f"{filename}_{variant.get('id', idx)}",
                                    "html_template": variant.get("html", variant.get("html_template", "")),
                                    "metadata": {
                                        "section_type": subdir.lower(),
                                        "structural_approach": variant.get("structural_approach", ""),
                                        "vibe_tags": variant.get("vibe_tags", ["bold", "minimal", "modern", "corporate", "tech", "luxury", "playful", "warm", "edgy"]),
                                        "js_dependency": variant.get("js_dependency", "static"),
                                        "tokens": variant.get("tokens_used", [])
                                    }
                                }
                                library.append(var_item)
                        elif isinstance(data, dict) and "metadata" in data:
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
        sec_type_meta = meta.get("section_type", "").lower()
        sec_target = section_type.lower()
        
        if sec_type_meta != sec_target:
            if sec_target in ["testimonial", "testimonials"] and sec_type_meta in ["testimonial", "testimonials"]:
                pass
            elif sec_target in ["feature", "features"] and sec_type_meta in ["feature", "features"]:
                pass
            elif sec_target in ["navbar", "navbars", "nav"] and sec_type_meta in ["navbar", "navbars", "nav"]:
                pass
            elif sec_target in ["footer", "footers", "foot"] and sec_type_meta in ["footer", "footers", "foot"]:
                pass
            elif sec_target in ["cta", "ctas", "form", "forms"] and sec_type_meta in ["cta", "ctas", "form", "forms"]:
                pass
            else:
                continue
            
        if not js_allowed and meta.get("js_dependency") in ["requires_js", "alpine"]:
            continue
            
        item_tags = meta.get("vibe_tags", [])
        if not set(target_tags).isdisjoint(set(item_tags)) or not item_tags:
            candidates.append({"template_file": item.get("template_file"), "metadata": meta})
            
    return candidates
