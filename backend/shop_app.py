import streamlit as st
import requests
import json
import re # Phone number validation ke liye

# --- Configuration ---
st.set_page_config(layout="wide", page_title="Mobile Cover Shop")
API_BASE_URL = "http://127.0.0.1:8000/api"
COVERS_API_URL = f"{API_BASE_URL}/covers"
NOTIFY_API_URL = f"{API_BASE_URL}/notify"
CATEGORY_API_URL = f"{API_BASE_URL}/categories"

# --- Social Media Links (Aapke links yahaan daalein) ---
WHATSAPP_LINK = "https://wa.me/911234567890" # Example link
INSTAGRAM_LINK = "https://www.instagram.com/yourprofile" # Example link
YOUTUBE_LINK = "https://www.youtube.com/yourchannel" # Example link
# ----------------------------------------------------

# --- API Check (Updated with timeout) ---
@st.cache_data(ttl=10) # 10 second ke liye cache karega
def check_api_status():
    try:
        # Timeout ko 2 se badhakar 10 second kar diya hai
        response = requests.get("http://127.0.0.1:8000/", timeout=10) 
        return response.status_code == 200
    except requests.exceptions.ConnectionError:
        return False
    except requests.exceptions.ReadTimeout: # Naya error handle
        print("API Status Check Timed Out (server is slow to start, probably fine)")
        return False
# --- End of Update ---

# --- API Helper: Fetch Categories (Updated with timeout) ---
@st.cache_data(ttl=30) # 30 second ke liye cache karega
def fetch_categories():
    """API se sabhi categories fetch karta hai."""
    try:
        response = requests.get(CATEGORY_API_URL, timeout=10) # Timeout add kiya
        if response.status_code == 200:
            return response.json()
        else:
            return []
    except Exception:
        return []
# --- End of Update ---

# --- Helper Function ---
def format_price(price):
    """Format price to ₹XX.XX"""
    return f"₹{price:,.2f}"

def validate_phone(phone):
    """Simple 10-digit phone number validation."""
    return re.match(r"^\d{10}$", phone)

# --- 'Order Now' Form (Reusable Function) ---
def show_order_form(model_name: str):
    """
    Ek reusable form dikhata hai 'Order Now' (Notify Me) ke liye.
    """
    st.info("Aap yeh product 'Order Now' kar sakte hain. Jab yeh stock mein aayega, hum aapko call karenge.", icon="ℹ️")
    
    with st.form(key=f"notify_form_{model_name.replace(' ', '_')}", border=True):
        st.subheader(f"Order Now: {model_name}")
        phone_num = st.text_input("Aapka 10-digit Phone Number*", max_chars=10, placeholder="9876543210")
        
        notify_submit = st.form_submit_button("Submit Request", type="primary", use_container_width=True)
        
        if notify_submit:
            if not validate_phone(phone_num):
                st.error("Please sahi 10-digit phone number daalein.", icon="🚨")
            else:
                payload = {
                    "phone": phone_num,
                    "modelName": model_name
                }
                with st.spinner("Aapki request save kar rahe hain..."):
                    try:
                        notify_response = requests.post(NOTIFY_API_URL + "/", json=payload, timeout=10)
                        if notify_response.status_code == 201:
                            st.success("Aapki request save ho gayi hai! Hum jald hi call karenge.", icon="✅")
                        else:
                            st.error(f"Request fail ho gayi: {notify_response.text}", icon="❌")
                    except Exception as e:
                         st.error(f"Server se connect nahi ho pa raha: {e}", icon="❌")

# --- Initialize App ---
is_api_online = check_api_status()
all_categories = fetch_categories()
category_map = {"All Categories": "all"}
category_map.update({cat['name']: cat['id'] for cat in all_categories})

# --- Sidebar Filters ---
st.sidebar.title("Apni Pasand Batayein")
st.sidebar.header("Filters")

selected_cat_name = st.sidebar.selectbox(
    "Category",
    options=category_map.keys()
)

gender = st.sidebar.selectbox(
    "Gender",
    ["All", "Unisex", "Ladies", "Gents"],
    index=0
)

cover_types = st.sidebar.multiselect(
    "Cover Type",
    ["Silicone", "Hard", "Flip", "Transparent", "Leather"]
)

min_price, max_price = st.sidebar.slider(
    "Price Range (₹)", 0.0, 5000.0, (0.0, 5000.0)
)

# --- Main Page UI ---
st.title("📱 Apne Mobile Ka Cover Dhoondein")
st.write("Bas apne mobile ka model naam daalein aur search karein.")

if not is_api_online:
    st.error("Dukaan abhi band hai (Server offline hai). Please 5 minute baad try karein.", icon="🚨")
else:
    model_search = st.text_input(
        "Apna mobile model search karein (e.g., iPhone 14, Samsung A15, Realme C3)",
        placeholder="Yahaan type karein..."
    )
    
    search_button = st.button("Search Karo", type="primary", use_container_width=True)
    
    st.divider()

    # --- Search Logic ---
    if search_button:
        if not model_search:
            st.warning("Please pehle model ka naam daalein.", icon="⚠️")
        else:
            params = {"model": model_search}
            
            if cover_types: params["coverType"] = cover_types
            if min_price > 0.0: params["minPrice"] = min_price
            if max_price < 5000.0: params["maxPrice"] = max_price
            if gender != "All": params["gender"] = gender
            
            selected_cat_id = category_map[selected_cat_name]
            if selected_cat_id != "all":
                params["category_ids"] = [selected_cat_id]

            try:
                with st.spinner(f"'{model_search}' ke liye covers dhoondh rahe hain..."):
                    response = requests.get(COVERS_API_URL + "/", params=params, timeout=10) # Timeout add kiya
                
                if response.status_code == 200:
                    covers = response.json()
                    
                    if covers:
                        st.success(f"Aapke model ke liye humein {len(covers)} cover(s) mile!")
                        
                        cols = st.columns(4) 
                        for i, cover in enumerate(covers):
                            with cols[i % 4]:
                                with st.container(border=True):
                                    st.image(cover['imageUrl'], use_column_width=True)
                                    st.subheader(cover['modelName'])
                                    st.text(f"{cover['coverType']} | {cover['color']}")
                                    st.markdown(f"**{format_price(cover['price'])}**")
                                    
                                    if cover['stock'] > 0:
                                        st.success(f"Stock mein hai ({cover['stock']} left)")
                                    else:
                                        st.error("Stock khatam!")
                                        if st.button("Order Now", key=f"order_{cover['id']}", use_container_width=True):
                                            st.session_state.order_model = cover['modelName']
                    
                    else:
                        st.warning(f"Maaf karein, '{model_search}' ke liye koi cover nahi mila.", icon="😞")
                        show_order_form(model_search)

                else:
                    st.error(f"API se error aaya: {response.status_code}")
                    st.json(response.text)
            except Exception as e:
                st.error(f"Connection fail ho gaya: {e}")

    if 'order_model' in st.session_state:
        show_order_form(st.session_state.order_model)
        del st.session_state.order_model

# --- Footer (Social Media Links) ---
st.divider()
st.subheader("Humse Judein")
col1, col2, col3 = st.columns(3)
with col1:
    st.link_button("WhatsApp 💬", WHATSAPP_LINK, use_container_width=True)
with col2:
    st.link_button("Instagram 📸", INSTAGRAM_LINK, use_container_width=True)
with col3:
    st.link_button("YouTube 🎥", YOUTUBE_LINK, use_container_width=True)