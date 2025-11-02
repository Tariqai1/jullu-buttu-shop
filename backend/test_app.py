import streamlit as st
import requests
import json
import pandas as pd
from io import BytesIO
import time
from datetime import datetime, timedelta, timezone

# --- Configuration ---
st.set_page_config(layout="wide", page_title="Admin Panel")
API_BASE_URL = "http://127.0.0.1:8000/api"
COVERS_API_URL = f"{API_BASE_URL}/covers"
NOTIFY_API_URL = f"{API_BASE_URL}/notify"
CATEGORY_API_URL = f"{API_BASE_URL}/categories"

# --- API Check (Updated with timeout) ---
@st.cache_data(ttl=5) # 5 second ke liye cache karega
def check_api_status():
    try:
        # Timeout ko 2 se badhakar 10 second kar diya hai
        response = requests.get("http://127.0.0.1:8000/", timeout=10) 
        return response.status_code == 200
    except requests.exceptions.ConnectionError:
        return False
    except requests.exceptions.ReadTimeout: # Naya error handle
        print("API Status Check Timed Out (server is slow to start, probably fine)")
        return False # Ise offline maan lein taaki app crash na ho
# --- End of Update ---

# --- API Helper: Fetch Categories ---
@st.cache_data(ttl=10) # 10 second ke liye cache karega
def fetch_categories():
    """API se sabhi categories fetch karta hai."""
    try:
        response = requests.get(CATEGORY_API_URL, timeout=10) # Yahaan bhi timeout add karein
        if response.status_code == 200:
            return response.json()
        else:
            st.error(f"Categories fetch nahi kar pa raha hoon: {response.status_code}")
            return []
    except Exception as e:
        st.error(f"Categories fetch karte waqt error: {e}")
        return []

# --- Helper Function: 5-Minute Rule ---
def is_editable(created_at_str: str) -> bool:
    """Check karta hai ki item 5 minute se kam purana hai ya nahi."""
    try:
        created_at = datetime.fromisoformat(created_at_str)
        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=timezone.utc)
        now_utc = datetime.now(timezone.utc)
        time_diff = now_utc - created_at
        return time_diff.total_seconds() < 300 # 5 minutes = 300 seconds
    except Exception as e:
        print(f"Error checking time: {e}")
        return False


# --- Main App ---
st.title("📱 Mobile Cover Shop - Admin Panel")
st.sidebar.header("API Status")
is_api_online = check_api_status()
if is_api_online:
    st.sidebar.success("Backend API: Online ✅")
else:
    st.sidebar.error("Backend API: Offline ❌")
    st.sidebar.info("Backend server (Terminal 1) ko run karein:\n`uvicorn main:app --port 8000`")
    st.error("Backend API se connect nahi ho pa raha. Please Terminal 1 mein server check karein.", icon="🚨")
    st.stop() # Agar API offline hai to app ko rok dein


all_categories = fetch_categories()
category_map = {cat['name']: cat['id'] for cat in all_categories}


# --- Tabs ---
tab1, tab2, tab3, tab4 = st.tabs([
    "📈 Dashboard (View/Edit/Delete)", 
    "📤 Upload Covers", 
    "🗂️ Manage Categories", 
    "🔔 View Pre-Order Requests"
])

# --- TAB 1: Dashboard (View/Edit/Delete) ---
with tab1:
    st.header("📈 Dashboard: View, Edit, & Delete Covers")

    with st.container(border=True):
        st.subheader("🔍 Filters")
        col1, col2, col3 = st.columns(3)
        with col1:
            model_search = st.text_input("Model Name (e.g., iPhone)")
        with col2:
            selected_cat_names = st.multiselect(
                "Category",
                options=category_map.keys()
            )
        with col3:
            gender = st.selectbox(
                "Gender",
                ["", "Unisex", "Ladies", "Gents"], index=0
            )
        
        search_button = st.button("Search Covers", type="primary", use_container_width=True)

    if search_button:
        params = {}
        if model_search: params["model"] = model_search
        if gender: params["gender"] = gender
        if selected_cat_names:
            params["category_ids"] = [category_map[name] for name in selected_cat_names]

        try:
            with st.spinner("API se data fetch kar raha hai..."):
                response = requests.get(COVERS_API_URL + "/", params=params, timeout=10)
            
            if response.status_code == 200:
                covers = response.json()
                st.success(f"Successfully fetched {len(covers)} cover(s)!")
                
                if not covers:
                    st.warning("Is filter ke liye koi cover nahi mila.", icon="⚠️")

                for cover in covers:
                    cover_id = cover['id']
                    with st.container(border=True):
                        col1, col2, col3 = st.columns([1, 2, 1])
                        
                        with col1:
                            st.image(cover['imageUrl'], use_column_width=True)
                        
                        with col2:
                            st.subheader(cover['modelName'])
                            st.text(f"Type: {cover['coverType']} | Color: {cover['color']}")
                            st.text(f"Stock: {cover['stock']} | Gender: {cover.get('genderPreference', 'N/A')}")
                            st.markdown(f"**Price: ₹{cover['price']:,.2f}**")
                            if is_editable(cover['createdAt']):
                                st.success("✅ Abhi edit kar sakte hain (5 min window)")
                            else:
                                st.info("ℹ️ 5 minute edit window poori ho chuki hai.")

                        with col3:
                            if st.button("Delete ❌", key=f"del_{cover_id}", use_container_width=True):
                                try:
                                    delete_response = requests.delete(f"{COVERS_API_URL}/{cover_id}", timeout=10)
                                    if delete_response.status_code == 204:
                                        st.success("Product delete ho gaya!")
                                        st.rerun()
                                    else:
                                        st.error(f"Delete fail hua: {delete_response.text}")
                                except Exception as e:
                                    st.error(f"Delete karte waqt error: {e}")

                            with st.expander("Edit ✏️", expanded=False):
                                editable = is_editable(cover['createdAt'])
                                with st.form(key=f"edit_{cover_id}"):
                                    st.write(f"Editing: {cover['modelName']}")
                                    new_modelName = st.text_input("Model Name", cover['modelName'])
                                    new_price = st.number_input("Price (₹)", value=cover['price'])
                                    new_stock = st.number_input("Stock", value=cover['stock'], min_value=0)
                                    
                                    current_cat_ids = set(cover['category_ids'])
                                    current_cat_names = [name for name, id in category_map.items() if id in current_cat_ids]
                                    
                                    new_cat_names = st.multiselect(
                                        "Categories",
                                        options=category_map.keys(),
                                        default=current_cat_names
                                    )
                                    
                                    save_button = st.form_submit_button(
                                        "Save Changes", 
                                        type="primary",
                                        disabled=not editable
                                    )
                                    
                                    if save_button:
                                        new_cat_ids = [category_map[name] for name in new_cat_names]
                                        update_payload = {
                                            "modelName": new_modelName,
                                            "price": new_price,
                                            "stock": new_stock,
                                            "category_ids": new_cat_ids
                                        }
                                        try:
                                            update_response = requests.put(
                                                f"{COVERS_API_URL}/{cover_id}", 
                                                json=update_payload,
                                                timeout=10
                                            )
                                            if update_response.status_code == 200:
                                                st.success("Update successful!")
                                                st.rerun()
                                            else:
                                                st.error(f"Update fail hua: {update_response.text}")
                                        except Exception as e:
                                            st.error(f"Update karte waqt error: {e}")
            else:
                st.error(f"Error from API: {response.status_code}")
                st.json(response.text)
        except Exception as e:
            st.error(f"Request fail ho gayi: {e}")

# --- TAB 2: Upload Covers ---
with tab2:
    st.header("📤 Ek Model ke Multiple Cover Upload Karein")
    
    if not all_categories:
        st.warning("Aapne abhi tak koi category nahi banayi hai.", icon="⚠️")
        st.info("Product upload karne se pehle, 'Manage Categories' tab mein jaayein aur ek category banayein.")
    
    with st.form("multi_upload_form"):
        with st.container(border=True):
            st.subheader("1. Common Details")
            col1, col2 = st.columns(2)
            with col1:
                modelName = st.text_input("Model Name*")
                coverType = st.text_input("Cover Type*", "Silicone")
                genderPreference = st.selectbox("Gender Preference", ["Unisex", "Ladies", "Gents"])
            with col2:
                price = st.number_input("Price (₹)*", min_value=0.01, value=599.0)
                stock = st.number_input("Stock*", min_value=0, value=50)
                tags = st.text_input("Tags (comma-separated)", "New, Matte")
            
            st.subheader("2. Category Select Karein*")
            selected_upload_cat_names = st.multiselect(
                "Is product ko kin categories mein daalein?*",
                options=category_map.keys(),
                help="Aap ek se zyada select kar sakte hain."
            )

        with st.container(border=True):
            st.subheader("3. Images Upload Karein*")
            uploaded_images = st.file_uploader(
                "Cover Images", 
                type=["png", "jpg", "jpeg", "webp"],
                accept_multiple_files=True
            )
        
        submit_button = st.form_submit_button(
            f"Upload {len(uploaded_images)} Covers", 
            type="primary", 
            use_container_width=True,
            disabled=not all_categories
        )

    if submit_button:
        if not all([modelName, coverType, price, stock, uploaded_images, selected_upload_cat_names]):
            st.error("Please sabhi *required fields bharein (Model, Type, Price, Stock, Category, aur Image).", icon="🚨")
        else:
            selected_cat_ids = [category_map[name] for name in selected_upload_cat_names]
            tags_list = [t.strip() for t in tags.split(",") if t.strip()]
            tags_json = json.dumps(tags_list)
            category_ids_json = json.dumps(selected_cat_ids)
            
            success_count = 0
            
            with st.status(f"Uploading {len(uploaded_images)} covers...", expanded=True) as status_box:
                for image in uploaded_images:
                    st.write(f"Uploading file: `{image.name}`...")
                    data = {
                        "modelName": modelName,
                        "coverType": coverType,
                        "color": "Varies",
                        "price": price,
                        "stock": stock,
                        "genderPreference": genderPreference,
                        "tags": tags_json,
                        "category_ids": category_ids_json
                    }
                    image_bytes = BytesIO(image.getvalue())
                    files = {"image": (image.name, image_bytes, image.type)}

                    try:
                        response = requests.post(COVERS_API_URL + "/", data=data, files=files, timeout=30)
                        if response.status_code == 201:
                            success_count += 1
                        else:
                            st.error(f"Error uploading `{image.name}`: {response.text}", icon="❌")
                    except Exception as e:
                        st.error(f"Connection error uploading `{image.name}`: {e}", icon="❌")
                    time.sleep(0.5)
            
            if success_count == len(uploaded_images):
                status_box.update(label=f"Successfully uploaded {success_count} covers!", state="complete")
                st.balloons()
            else:
                status_box.update(label=f"Process complete: {success_count} / {len(uploaded_images)} uploaded.", state="error")

# --- TAB 3: Manage Categories ---
with tab3:
    st.header("🗂️ Manage Categories")
    
    col1, col2 = st.columns(2)
    
    with col1:
        with st.container(border=True):
            st.subheader("Nayi Category Banayein")
            with st.form("new_category_form", clear_on_submit=True):
                cat_name = st.text_input("Category Name* (e.g., Silicone Cases)")
                cat_desc = st.text_area("Description (Optional)")
                add_cat_button = st.form_submit_button("Add Category", type="primary")
                
            if add_cat_button:
                if not cat_name:
                    st.error("Category name zaroori hai.", icon="🚨")
                else:
                    payload = {"name": cat_name, "description": cat_desc}
                    try:
                        response = requests.post(CATEGORY_API_URL + "/", json=payload, timeout=10)
                        if response.status_code == 201:
                            st.success(f"Category '{cat_name}' ban gayi!", icon="✅")
                            st.rerun()
                        elif response.status_code == 400:
                            st.error(f"Error: {response.json().get('detail')}", icon="❌")
                        else:
                            st.error(f"Category banane mein fail hua: {response.text}", icon="❌")
                    except Exception as e:
                        st.error(f"Category banate waqt error: {e}")

    with col2:
        with st.container(border=True):
            st.subheader("Sabhi Categories")
            if not all_categories:
                st.info("Abhi koi category nahi hai.")
            
            for cat in all_categories:
                cat_id = cat['id']
                with st.container(border=True):
                    c1, c2 = st.columns([3, 1])
                    with c1:
                        st.subheader(cat['name'])
                        if cat.get('description'):
                            st.write(cat['description'])
                    with c2:
                        if st.button("Delete ❌", key=f"del_cat_{cat_id}", use_container_width=True):
                            try:
                                response = requests.delete(f"{CATEGORY_API_URL}/{cat_id}", timeout=10)
                                if response.status_code == 204:
                                    st.success(f"Category '{cat['name']}' delete ho gayi!")
                                    st.rerun()
                                else:
                                    st.error(f"Delete fail hua: {response.text}")
                            except Exception as e:
                                st.error(f"Category delete karte waqt error: {e}")

# --- TAB 4: Pre-Order Notifications ---
with tab4:
    st.header("🔔 View Pre-Order Requests")
    st.info("Yeh woh log hain jinhein unka model nahi mila aur unhonne 'Notify Me' request ki hai.")
    
    with st.container(border=True):
        refresh_button = st.button("Refresh Pending List")
        
        if refresh_button:
            try:
                with st.spinner("Pending requests fetch kar raha hai..."):
                    response = requests.get(NOTIFY_API_URL + "/", timeout=10)
                if response.status_code == 200:
                    requests_data = response.json()
                    st.success(f"Total {len(requests_data)} pending request(s) mili.", icon="📈")
                    
                    if requests_data:
                        df = pd.DataFrame(requests_data)
                        df_display = df[["phone", "modelName", "createdAt"]]
                        df_display["createdAt"] = pd.to_datetime(df_display["createdAt"]).dt.strftime('%Y-%m-%d %H:%M')
                        st.dataframe(df_display, use_container_width=True)
                    else:
                        st.info("Koi pending notification request nahi hai.")
                else:
                    st.error(f"Error from API: {response.status_code}", icon="❌")
                    st.json(response.text)
            except Exception as e:
                st.error(f"Request fail ho gayi: {e}")