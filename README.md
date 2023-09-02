## PicoFrame Server

This is a server for my PicoFrame. It uses a Google Cloud Service Account to find images uploaded to google drive and then crop and resize them for a [Pimoroni InkyFrame](https://shop.pimoroni.com/search?q=inky%20frame).

### Config

```
# Port the server listens to
PORT=4000

# API Key protecting the endpoints
API_KEY=

# Path to Google Cloud Service Account credentials
# (see below)
CREDENTIALS=./credentials.json

# Google Drive folder ids to look in.
# If this is empty then the server will download
# anything shared with the google service account
FOLDER_IDS=

# Path to save images to
IMAGE_DIR=./pico_frame_images/

# Image file extensions
IMAGE_EXTS=.png,.jpg,.jpeg
```

### Google Cloud Service Account

To list and download images from your google drive you will need a google cloud service account.

Head over to https://console.cloud.google.com/apis/credentials. If you've not already signed up, you will need to agree to the terms and services.

**Create a new project** and give it a name.

##### Enable Google Drive APIs
1. Click on **Enabled APIs & Services** then **+ Enable APIs and Services**

2. Search for **Drive** and click on **Google Drive API** and then **Enable**

##### Setup OAuth details
1. Click on **OAuth consent screen** and select **External** then **create**

2. Fill in the required details and anything else you want and click **Save and continue**.

3. Click **Add or remove scopes**

4. Search for **/auth/drive.readonly** and check it

5. Click **Update** at the bottom.

6. Click **Save and continue**

7. Add any test users you'd like and then click **Save and continue**

##### Create service account

1. Click **Credentials**

2. Click **+ Create Credentials** then **Service account**

3. Fill in the name

4. Click **Save and continue**

5. Click **Continue**

6. Click **Done**

##### Create service account keys

1. Click on the service account you just created

2. Click the **Keys** tab

3. Click **Add Key** then **Create new key**

4. Select **JSON** then **Create**

5. Save the key and place it in the project folder named **credentials.json**

##### Give your service account access to your google drive

1. Click on your service account then **Details**

2. Copy the email address

3. Go to https://drive.google.com/drive/ and click on a file or folder your want to make available to your service account

4. Click **Share** and paste the email address into the text box and click **Send**

5. Repeat for each file and folder your want to share
