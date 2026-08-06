import cv2
import mediapipe as mp
import csv
import os

# --- PENGATURAN AWAL ---

# 1. Tentukan folder utama tempat Anda menyimpan SEMUA folder dataset
#    (Berdasarkan screenshot Anda, ini adalah nama foldernya)
ROOT_DATASET_FOLDER = 'Dataset_Video_Kodaly'

# 2. Nama file output untuk dataset gabungan
NAMA_FILE_COMBINE = 'dataset_combine.csv'

# 3. Inisialisasi MediaPipe Hands
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=1,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

# --- PERSIAPAN HEADER CSV ---
# Header ini harus sama persis dengan file contoh Anda
header = ['nada']
for i in range(21):
    header.append(f'x{i}')
for i in range(21):
    header.append(f'y{i}')
for i in range(21):
    header.append(f'z{i}')

# --- PROSES UTAMA ---

# List untuk menampung SEMUA baris data dari SEMUA orang
all_data_rows = []

print(f"Memulai pemrosesan dari root folder: '{ROOT_DATASET_FOLDER}'")

# 1. Loop untuk setiap folder orang (dataset_rainova, dataset_tegar, dll.)
#    os.listdir -> membaca isi dari folder
for person_folder_name in os.listdir(ROOT_DATASET_FOLDER):
    
    # Path lengkap ke folder orang tsb
    person_folder_path = os.path.join(ROOT_DATASET_FOLDER, person_folder_name)
    
    # Pastikan itu adalah folder, bukan file
    if not os.path.isdir(person_folder_path):
        continue

    print(f"\n--- Memproses Folder: {person_folder_name} ---")
    
    # List untuk menampung data HANYA orang ini
    person_data_rows = []
    
    # Nama file CSV untuk orang ini
    individual_csv_name = f"{person_folder_name}.csv"

    # 2. Loop untuk setiap file video di dalam folder orang
    for video_file_name in os.listdir(person_folder_path):
        
        # Dapatkan nama file (misal "Do.mp4" atau "Fa#.mp4")
        # dan pastikan itu file video
        if not (video_file_name.endswith('.mp4') or video_file_name.endswith('.mov')):
            continue
            
        # Ekstrak label 'nada' dari nama file
        # os.path.splitext("Do.mp4") -> ("Do", ".mp4")
        # Kita ambil bagian pertamanya -> "Do"
        nada_label = os.path.splitext(video_file_name)[0]
        
        # Path lengkap ke file video
        video_path = os.path.join(person_folder_path, video_file_name)
        
        print(f"Membaca video: '{video_file_name}' (Label: {nada_label})")

        # Buka video
        cap = cv2.VideoCapture(video_path)
        
        # 3. Loop untuk setiap frame di dalam video
        while cap.isOpened():
            success, image = cap.read()
            if not success:
                break # Video selesai

            # Konversi ke RGB dan proses dengan MediaPipe
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            results = hands.process(image_rgb)

            # 4. Jika tangan terdeteksi, ekstrak data
            if results.multi_hand_landmarks:
                hand_landmarks = results.multi_hand_landmarks[0]
                
                # Siapkan list untuk menyimpan data satu baris
                row = [nada_label]
                x_coords = [lm.x for lm in hand_landmarks.landmark]
                y_coords = [lm.y for lm in hand_landmarks.landmark]
                z_coords = [lm.z for lm in hand_landmarks.landmark]
                
                row.extend(x_coords)
                row.extend(y_coords)
                row.extend(z_coords)
                
                # 5. Tambahkan baris data ke list
                person_data_rows.append(row)
                all_data_rows.append(row)
        
        cap.release()

    # 6. Simpan CSV individual untuk orang ini
    if person_data_rows:
        with open(individual_csv_name, 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(header)       # Tulis header
            writer.writerows(person_data_rows) # Tulis semua data orang ini
        print(f"Berhasil menyimpan: '{individual_csv_name}'")

# 7. Simpan CSV GABUNGAN
if all_data_rows:
    with open(NAMA_FILE_COMBINE, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(header)       # Tulis header
        writer.writerows(all_data_rows) # Tulis SEMUA data
    print(f"\n===============================================")
    print(f"BERHASIL! Dataset gabungan disimpan di: {NAMA_FILE_COMBINE}")
    print(f"Total {len(all_data_rows)} baris data dikumpulkan.")
    print("===============================================")
else:
    print("Tidak ada data yang diproses. Pastikan struktur folder Anda benar.")

hands.close()