import cv2
import numpy as np
import face_recognition
import os
from datetime import datetime
from pymongo import MongoClient

# === MongoDB Connection ===
client = MongoClient("mongodb+srv://student:student123@cluster0.h6zclo6.mongodb.net/studentachievementsdb")  # Connect to the existing 'studentachievementsdb'
db = client['studentachievementsdb']  # Use the existing 'studentachievementsdb' database
collection = db['attendances']  # Use or create the 'attendance' collection within the existing database

# === Path to the images for recognition ===
path = 'D:/attendance/Face-recognition-Attendance-System-Project/Images_Attendance'
images = []
classNames = []
myList = os.listdir(path)
print(myList)
for cl in myList:
    curImg = cv2.imread(f'{path}/{cl}')
    images.append(curImg)
    classNames.append(os.path.splitext(cl)[0])
print(classNames)

# === Encode all faces in the directory ===
def findEncodings(images):
    encodeList = []
    for img in images:
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        encode = face_recognition.face_encodings(img)[0]
        encodeList.append(encode)
    return encodeList

# === Log attendance to MongoDB ===
def markAttendance(name):
    time_now = datetime.now()
    tString = time_now.strftime('%H:%M:%S')
    dString = time_now.strftime('%d/%m/%Y')

    existing = collection.find_one({'name': name})

    if existing:
        # Update timestamp
        collection.update_one(
            {'name': name},
            {'$set': {'time': tString, 'date': dString}}
        )
    else:
        # Insert new record
        collection.insert_one({
            'name': name,
            'time': tString,
            'date': dString
        })

# === Main Execution ===
encodeListKnown = findEncodings(images)
print('Encoding Complete')

cap = cv2.VideoCapture(0)  # 0 for default camera; change to 1 or 2 for external cams
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1920)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 1080)

while True:
    success, img = cap.read()
    if not success:
        print("Camera not accessible")
        break

    imgS = cv2.resize(img, (0, 0), None, 0.25, 0.25)
    imgS = cv2.cvtColor(imgS, cv2.COLOR_BGR2RGB)

    facesCurFrame = face_recognition.face_locations(imgS)
    encodesCurFrame = face_recognition.face_encodings(imgS, facesCurFrame)

    for encodeFace, faceLoc in zip(encodesCurFrame, facesCurFrame):
        matches = face_recognition.compare_faces(encodeListKnown, encodeFace)
        faceDis = face_recognition.face_distance(encodeListKnown, encodeFace)
        matchIndex = np.argmin(faceDis)

        if matches[matchIndex]:
            name = classNames[matchIndex].upper()
            print(name)

            y1, x2, y2, x1 = faceLoc
            y1, x2, y2, x1 = y1 * 4, x2 * 4, y2 * 4, x1 * 4

            cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.rectangle(img, (x1, y2 - 35), (x2, y2), (0, 250, 0), cv2.FILLED)
            cv2.putText(img, name, (x1 + 6, y2 - 6),
                        cv2.FONT_HERSHEY_COMPLEX, 1, (255, 255, 255), 2)

            markAttendance(name)

    # Display the webcam window in wide resolution
    cv2.namedWindow('webcam', cv2.WINDOW_NORMAL)
    cv2.resizeWindow('webcam', 1920, 1080)
    cv2.imshow('webcam', img)

    # Press Enter to break the loop
    if cv2.waitKey(10) == 13:
        break

cap.release()
cv2.destroyAllWindows()
