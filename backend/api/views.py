from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserSerializer
import tensorflow as tf
import os
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from PIL import Image
import io
import joblib
import pickle

MODEL_PATH = 'api/models/model_boq.h5'
LINEAR_REGRESSION_MODEL_PATH = 'api/models/linear_regression_model.pkl'
SCALER_PATH = 'api/models/scaler.pkl'
REG_SCALER_PATH = 'api/models/reg_scaler.pkl'

# Load the model with error handling
try:
    model = tf.keras.models.load_model(MODEL_PATH, custom_objects={'mse': tf.keras.losses.MeanSquaredError()})
except Exception as e:
    print("Error loading model:", e)
    model = None

# Load the linear regression model
with open(LINEAR_REGRESSION_MODEL_PATH, 'rb') as model_file:
    linear_reg_model = pickle.load(model_file)    

# Load scaler
scaler = None
with open(SCALER_PATH, 'rb') as file:
    scaler = joblib.load(file)

# Load reg_scaler
reg_scaler = None
with open(REG_SCALER_PATH, 'rb') as file:
    reg_scaler = joblib.load(file)    

@api_view(['POST'])
def signup(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    user = authenticate(username=username, password=password)
    
    if user is not None:
        return Response({"message": "Login successful!"}, status=status.HTTP_200_OK)
    else:
        return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def predict_house_details(request):
    # Check if the model was loaded successfully
    if not model:
        return Response({'error': 'Model could not be loaded.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    # Validate image in request
    if 'image' not in request.FILES:
        return Response({'error': 'No image provided.'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Load and process the image
        image_file = request.FILES['image']
        image = Image.open(image_file)
        image = image.resize((224, 224))  # Resize the image to match the model input shape
        image_array = np.array(image) / 255.0  # Normalize the image
        image_array = np.expand_dims(image_array, axis=0)  # Add batch dimension

        # Predict using the model
        predictions_scaled = model.predict(image_array)
        predictions = scaler.inverse_transform(predictions_scaled)


        square_feet = int(predictions[0][0])
        beds = int(predictions[0][1])
        baths = int(predictions[0][2])
        garages = int(predictions[0][3])

        # Prepare the data for the linear regression model
        input_features = np.array([[square_feet, beds, baths, garages]])

        # Scale the input features for the linear regression model
        input_features_scaled = reg_scaler.transform(input_features)

        # Predict the estimated cost using the linear regression model
        estimated_cost = linear_reg_model.predict(input_features_scaled)[0]

        # Prepare the result to be returned
        result = {
            'square_feet': square_feet,
            'beds': beds,
            'baths': baths,
            'garages': garages,
            'estimated_cost': estimated_cost  
            }

        return Response(result, status=status.HTTP_200_OK)

    except Exception as e:
        print(f"Error during prediction: {e}")
        return Response({'error': 'Error during prediction. Please check the input image and try again.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)