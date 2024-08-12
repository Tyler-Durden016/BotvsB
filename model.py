import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.metrics import confusion_matrix, roc_auc_score
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Embedding, Flatten, Input
from tensorflow.keras.callbacks import EarlyStopping
from tensorflow.keras.models import Model

# Load data
df = pd.read_csv('bot_detection_data.csv')
print("Loading Data")

# Handle missing values
numeric_features = df.select_dtypes(include=['int64', 'float64']).columns
categorical_features = df.select_dtypes(include=['object']).columns

# Target variable
X = df.drop('isBot', axis=1)
y = df['isBot']

# Split the data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)

# Define Preprocessing for numerical data
numeric_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='mean')),
    ('scaler', StandardScaler())])

preprocessor = ColumnTransformer(
    transformers=[
        ('num', numeric_transformer, numeric_features)], 
    remainder='passthrough')

X_train_numeric = preprocessor.fit_transform(X_train)
X_test_numeric = preprocessor.transform(X_test)

# Define the input layers
input_numeric = Input(shape=(X_train_numeric.shape[1],))
input_categorical = Input(shape=(len(categorical_features),))

# Embedding layer for categorical data
embedding_size = 10  # You can adjust this size
embedding_layers = []
for i, cat_col in enumerate(categorical_features):
    unique_values = len(X_train[cat_col].unique())
    embedding_layers.append(Embedding(input_dim=unique_values, output_dim=embedding_size)(input_categorical[:, i]))

# Flatten the embedding layers and concatenate them
flattened_layers = [Flatten()(embed) for embed in embedding_layers]
categorical_output = Flatten()(flattened_layers[0]) if len(flattened_layers) == 1 else concatenate(flattened_layers)

# Combine numeric and categorical features
combined = concatenate([input_numeric, categorical_output])

# Add Dense layers for classification
x = Dense(64, activation='relu')(combined)
x = Dense(32, activation='relu')(x)
output = Dense(1, activation='sigmoid')(x)

# Define the model
model = Model(inputs=[input_numeric, input_categorical], outputs=output)
model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])

# Early Stopping
early_stopping = EarlyStopping(monitor='val_loss', patience=5)

# Train the model
model.fit([X_train_numeric, X_train[categorical_features].values], y_train, 
          validation_data=([X_test_numeric, X_test[categorical_features].values], y_test), 
          epochs=100, batch_size=32, callbacks=[early_stopping])

# Evaluate the model
y_pred = model.predict([X_test_numeric, X_test[categorical_features].values])
roc_score = roc_auc_score(y_test, y_pred)
print("ROC AUC Score:", roc_score)
