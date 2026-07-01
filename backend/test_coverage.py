from dotenv import load_dotenv
load_dotenv()
from app.services.kto_coverage import calculate_kto_coverage
print(calculate_kto_coverage('서울', '바다', 150))
