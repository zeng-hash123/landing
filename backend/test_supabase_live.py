import dotenv
from models import PageState, PageBrief, SectionSelection
from storage import save_page, save_version, get_versions, get_version

dotenv.load_dotenv()

brief = PageBrief(
    product_description="Supabase Live Persistence Test Product",
    campaign_goal="Lead generation",
    design_vibe="Bold & modern",
    cta_focus="Single strong CTA"
)
state = PageState(
    brief=brief,
    brand_kit=None,
    sections=[SectionSelection(section_type="hero", template_file="hero1.json", values={"headline": "Supabase Test v1"})],
    meta={"meta_title": "Supabase Test Title"},
    flags=[]
)

print("1. Saving page to Supabase...")
page_id = save_page(state)
print(f"   Page ID created in Supabase: {page_id}")

print("2. Saving version 1 to Supabase...")
save_version(page_id, state, "<html>v1 content</html>")

print("3. Updating state and saving version 2 to Supabase...")
state.sections[0].values["headline"] = "Supabase Test v2"
save_version(page_id, state, "<html>v2 content</html>")

print("4. Querying Supabase for versions list...")
versions = get_versions(page_id)
print(f"   Retrieved {len(versions)} versions from Supabase:")
for v in versions:
    print(f"   - Version ID: {v.get('id')}, CreatedAt: {v.get('created_at')}, HTML snippet: {v.get('html', '')[:20]}")

assert len(versions) == 2, f"Expected 2 versions in Supabase, got {len(versions)}"
print("\nSUCCESS: All versions are 100% saved and retrieved from Supabase Postgres!")
