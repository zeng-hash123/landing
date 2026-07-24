import uuid
from models import PageState, PageNotFoundError, VersionNotFoundError
from supabase_client import supabase_client
from typing import List, Dict, Optional
from datetime import datetime, timezone

# Fallback in-memory storage if Supabase SQL schema has not been executed yet
_memory_pages: Dict[str, Dict] = {}
_memory_versions: List[Dict] = []
_memory_pro_users: set = set()
_use_memory_fallback = (supabase_client is None)

def save_pro_user(email: str) -> bool:
    global _use_memory_fallback
    clean_email = email.lower().strip()
    if not clean_email:
        return False

    _memory_pro_users.add(clean_email)

    if not _use_memory_fallback and supabase_client:
        try:
            payload = {
                "email": clean_email,
                "plan": "pro",
                "status": "active",
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            supabase_client.table("subscriptions").upsert(payload).execute()
        except Exception as e:
            print(f"Notice: Supabase save_pro_user subscription save ({e})")
    return True

def get_user_plan(email: str) -> str:
    global _use_memory_fallback
    clean_email = email.lower().strip()
    if not clean_email:
        return "free"
    
    if clean_email == "zeng07292@gmail.com":
        return "admin"

    if clean_email in _memory_pro_users:
        return "pro"

    if not _use_memory_fallback and supabase_client:
        try:
            res = supabase_client.table("subscriptions").select("plan, status").eq("email", clean_email).execute()
            if res.data and len(res.data) > 0:
                user_sub = res.data[0]
                status = user_sub.get("status", "")
                plan = user_sub.get("plan", "free")
                if plan in ["pro", "unlimited", "active"] or status in ["active", "succeeded"]:
                    _memory_pro_users.add(clean_email)
                    return "pro"
        except Exception as e:
            if _is_table_missing_error(e):
                pass
            else:
                print(f"Notice: Supabase get_user_plan check ({e})")

    return "free"

def _is_table_missing_error(e: Exception) -> bool:
    err_str = str(e)
    return "PGRST205" in err_str or "Could not find the table" in err_str or "relation" in err_str

def save_page(state: PageState, created_by: Optional[str] = None) -> str:
    global _use_memory_fallback
    page_id = str(uuid.uuid4())
    user_id = created_by or state.created_by
    data = {
        "id": page_id,
        "brief": state.brief.model_dump(),
        "brand_kit": state.brand_kit.model_dump() if state.brand_kit else None,
        "sections": [s.model_dump() for s in state.sections],
        "meta": state.meta,
        "flags": state.flags,
        "created_by": user_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Store in memory fallback first
    _memory_pages[page_id] = data

    if not _use_memory_fallback:
        try:
            insert_payload = {
                "brief": data["brief"],
                "brand_kit": data["brand_kit"],
                "sections": data["sections"],
                "meta": data["meta"],
                "flags": data["flags"]
            }
            if user_id:
                insert_payload["created_by"] = user_id

            res = supabase_client.table("pages").insert(insert_payload).execute()
            if res.data and len(res.data) > 0:
                supa_id = res.data[0]["id"]
                _memory_pages[supa_id] = data
                return supa_id
        except Exception as e:
            if _is_table_missing_error(e):
                print("Notice: Supabase 'pages' table missing, using in-memory storage.")
                _use_memory_fallback = True
            else:
                print(f"Notice: Supabase save_page failed ({e}), using in-memory fallback.")
                
    return page_id

def load_page(page_id: str) -> PageState:
    global _use_memory_fallback
    if not _use_memory_fallback:
        try:
            res = supabase_client.table("pages").select("*").eq("id", page_id).execute()
            if res.data and len(res.data) > 0:
                data = res.data[0]
                return PageState(
                    brief=data["brief"],
                    brand_kit=data.get("brand_kit"),
                    sections=data["sections"],
                    meta=data["meta"],
                    flags=data.get("flags", []),
                    created_by=data.get("created_by")
                )
        except Exception as e:
            if _is_table_missing_error(e):
                _use_memory_fallback = True

    # Fallback memory search
    if page_id not in _memory_pages:
        raise PageNotFoundError(f"Page {page_id} not found")
    data = _memory_pages[page_id]
    return PageState(
        brief=data["brief"],
        brand_kit=data.get("brand_kit"),
        sections=data["sections"],
        meta=data["meta"],
        flags=data.get("flags", []),
        created_by=data.get("created_by")
    )

def update_page(page_id: str, state: PageState):
    global _use_memory_fallback
    data = {
        "brief": state.brief.model_dump(),
        "brand_kit": state.brand_kit.model_dump() if state.brand_kit else None,
        "sections": [s.model_dump() for s in state.sections],
        "meta": state.meta,
        "flags": state.flags,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    if state.created_by:
        data["created_by"] = state.created_by

    if page_id in _memory_pages:
        _memory_pages[page_id].update(data)

    if not _use_memory_fallback:
        try:
            supabase_client.table("pages").update(data).eq("id", page_id).execute()
        except Exception as e:
            if _is_table_missing_error(e):
                _use_memory_fallback = True

def save_version(page_id: str, state: PageState, html: str, created_by: Optional[str] = None):
    global _use_memory_fallback
    version_id = str(uuid.uuid4())
    user_id = created_by or state.created_by
    version_data = {
        "id": version_id,
        "page_id": page_id,
        "state": {
            "brief": state.brief.model_dump(),
            "brand_kit": state.brand_kit.model_dump() if state.brand_kit else None,
            "sections": [s.model_dump() for s in state.sections],
            "meta": state.meta,
            "flags": state.flags,
            "created_by": user_id
        },
        "html": html,
        "created_by": user_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Always append to memory list first
    _memory_versions.append(version_data)

    if not _use_memory_fallback:
        try:
            insert_payload = {
                "page_id": page_id,
                "state": version_data["state"],
                "html": html
            }
            if user_id:
                insert_payload["created_by"] = user_id

            res = supabase_client.table("page_versions").insert(insert_payload).execute()
            if res.data and len(res.data) > 0:
                supa_ver_id = res.data[0]["id"]
                version_data["id"] = supa_ver_id
        except Exception as e:
            if _is_table_missing_error(e):
                _use_memory_fallback = True

def get_versions(page_id: str) -> List[Dict]:
    global _use_memory_fallback
    if not _use_memory_fallback:
        try:
            res = supabase_client.table("page_versions").select("id, created_at, html, state, created_by").eq("page_id", page_id).order("created_at", desc=True).execute()
            if res.data and len(res.data) > 0:
                return res.data
        except Exception as e:
            if _is_table_missing_error(e):
                _use_memory_fallback = True

    # Return memory versions reversed (newest first)
    mem_matches = [v for v in reversed(_memory_versions) if v["page_id"] == page_id]
    return mem_matches

def get_version(version_id: str) -> Dict:
    global _use_memory_fallback
    if not _use_memory_fallback:
        try:
            res = supabase_client.table("page_versions").select("*").eq("id", version_id).execute()
            if res.data and len(res.data) > 0:
                return res.data[0]
        except Exception as e:
            if _is_table_missing_error(e):
                _use_memory_fallback = True

    v = next((item for item in _memory_versions if item["id"] == version_id), None)
    if not v:
        raise VersionNotFoundError(f"Version {version_id} not found")
    return v
