import dotenv
from models import PageState, PageBrief, SectionSelection
from storage import save_page, save_version, get_versions, get_version, load_page

dotenv.load_dotenv()

brief = PageBrief(
    product_description="Version Test Product",
    campaign_goal="Lead generation",
    design_vibe="Bold & modern",
    cta_focus="Single strong CTA"
)
state = PageState(
    brief=brief,
    brand_kit=None,
    sections=[SectionSelection(section_type="hero", template_file="hero1.json", values={"headline": "Test v1"})],
    meta={"meta_title": "Test Title"},
    flags=[]
)

print("1. Saving page...")
page_id = save_page(state)
print(f"   Page ID created: {page_id}")

print("2. Saving version 1...")
save_version(page_id, state, "<html>v1</html>")

print("3. Updating state and saving version 2...")
state.sections[0].values["headline"] = "Test v2"
save_version(page_id, state, "<html>v2</html>")

print("4. Fetching versions list...")
versions = get_versions(page_id)
print(f"   Fetched {len(versions)} versions:")
for v in versions:
    print(f"   - ID: {v.get('id')}, CreatedAt: {v.get('created_at')}")

if len(versions) > 0:
    print("5. Fetching single version details...")
    v_details = get_version(versions[0]['id'])
    print(f"   Fetched version {v_details.get('id')} HTML length: {len(v_details.get('html', ''))}")
    print("\nSUCCESS! Version history API pipeline is fully working.")
else:
    print("\nFAILED: No versions retrieved!")
