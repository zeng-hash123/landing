from fastapi import FastAPI, HTTPException, Request, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import json

from models import GenerateRequest, EditRequest, PageNotFoundError, VersionNotFoundError, PageState
from pipeline import generate_landing_page
from editing import apply_edit
from storage import load_page, get_versions, get_version, update_page, save_version, save_pro_user, get_user_plan
from renderer import assemble_page
from library import load_component_library

import os

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load component library
    base_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "component-library"))
    app.state.library = load_component_library(base_path)
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api")
async def root_health_check():
    return {"status": "ok", "message": "FastAPI Landing Page Generator Service Running"}

@app.post("/webhook/dodopayments")
@app.post("/api/webhook/dodopayments")
@app.post("/dodo")
@app.post("/webhook/dodo")
@app.post("/api/dodo")
@app.post("/api/webhook/dodo")
async def dodo_payments_webhook(request: Request):
    try:
        body = await request.json()
        print(f"Dodo Payments Webhook Event Received: {json.dumps(body)}")
        
        event_type = body.get("type") or body.get("event") or ""
        data = body.get("data", {})
        
        customer_email = None
        if isinstance(data, dict):
            customer = data.get("customer", {})
            if isinstance(customer, dict):
                customer_email = customer.get("email")
            if not customer_email:
                customer_email = data.get("email") or data.get("customer_email")
        if not customer_email:
            customer_email = body.get("customer_email") or body.get("email")
            
        if customer_email:
            email = str(customer_email).strip().lower()
            save_pro_user(email)
            print(f"SUCCESS: Marked user {email} as PRO via Dodo Payments webhook ({event_type})")
            return {"status": "success", "message": f"User {email} activated as Pro"}
        
        return {"status": "ignored", "message": "No customer email found in webhook payload"}
    except Exception as e:
        print(f"Error processing Dodo Payments webhook: {e}")
        return JSONResponse(status_code=400, content={"status": "error", "message": str(e)})

@app.get("/user/plan")
@app.get("/api/user/plan")
async def check_user_plan(email: str = Query(...)):
    plan = get_user_plan(email)
    return {"email": email, "plan": plan}

@app.post("/user/activate-pro")
@app.post("/api/user/activate-pro")
async def activate_pro_user(request: Request):
    try:
        body = await request.json()
        email = body.get("email", "").strip().lower()
        if email:
            save_pro_user(email)
            return {"status": "success", "email": email, "plan": "pro"}
        raise HTTPException(status_code=400, detail="Email is required")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate")
async def generate_page(req: GenerateRequest, request: Request):
    library = request.app.state.library
    try:
        res = await generate_landing_page(req, library)
        return res
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/edit")
async def edit_page(req: EditRequest, request: Request):
    library = request.app.state.library
    try:
        res = await apply_edit(req.page_id, req, library)
        return res
    except PageNotFoundError:
        raise HTTPException(status_code=404, detail="Page not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/page/{page_id}")
async def get_page(page_id: str, request: Request):
    library = request.app.state.library
    try:
        state = load_page(page_id)
        html = assemble_page(state.sections, state.meta, None, library, brand_kit=state.brand_kit)
        return {"state": state.model_dump(), "html": html}
    except PageNotFoundError:
        raise HTTPException(status_code=404, detail="Page not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/page/{page_id}/versions")
async def list_versions(page_id: str):
    try:
        versions = get_versions(page_id)
        return {"versions": versions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/page/{page_id}/revert/{version_id}")
async def revert_page(page_id: str, version_id: str, request: Request):
    library = request.app.state.library
    try:
        version = get_version(version_id)
        state_dict = version["state"]
        
        state = PageState(**state_dict)
        
        update_page(page_id, state)
        html = assemble_page(state.sections, state.meta, None, library)
        
        save_version(page_id, state, html)
        
        return {"html": html, "message": "Reverted successfully"}
    except VersionNotFoundError:
        raise HTTPException(status_code=404, detail="Version not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
