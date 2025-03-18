# Extension Cookie Manager

This extension helps you manage cookies easily with the functions of storing and downloading cookies from Google Drive if you have set up the API.

## Usage

- Click the **Save Cookie** button to save the current cookie and Upload to Google Drive if you have set up the API.

- Click the **Cloud** button to download cookies from Google Drive to the Extension.

### Installation Guide for Appscript API

1. **Create a New Project on Google Apps Script:**
   - Visit [Google Apps Script](https://script.google.com/).
   - Click on the “New project” button to create a new project.

2. **Paste the API Code:**
   - Copy the following code and paste it into the code editor of the newly created project:

```javascript
var FolderName = "";      // Replace with your storage folder name
var ExpectedKey = "";  // Replace with your security key

function getFolderIdByName(foldername) {
  var folders = DriveApp.getFoldersByName(foldername);
  
  if (folders.hasNext()) {
    var folder = folders.next();
    Logger.log("Folder ID: " + folder.getId());
    return folder.getId();
  } else {
    Logger.log("Folder not found!");
    return null;
  }
}

function doPost(e) {
  var folderId = getFolderIdByName(FolderName);
  var folder = DriveApp.getFolderById(folderId);
  
  try {
    var params = JSON.parse(e.postData.contents);
    var filename = params.filename;
    var jsonData = params.data;
    var secretKey = params.key;
    
    if (secretKey !== ExpectedKey) {
      return ContentService.createTextOutput(JSON.stringify({"status": "error", "message": "Unauthorized"}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Create a blob from JSON data
    var fileBlob = Utilities.newBlob(JSON.stringify(jsonData, null, 2), "application/json", filename);
    
    // Check if the file already exists
    var files = folder.getFilesByName(filename);
    var file;
    
    if (files.hasNext()) {
      // If the file exists, delete the old file and create a new one
      file = files.next();
      file.setTrashed(true); // Move the old file to trash
      file = folder.createFile(fileBlob); // Create a new file
    } else {
      // If the file does not exist, create a new file
      file = folder.createFile(fileBlob);
    }
    
    return ContentService.createTextOutput(JSON.stringify({"status": "success", "fileUrl": file.getUrl()}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({"status": "error", "message": error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  var folderId = getFolderIdByName(FolderName);
  var folder = DriveApp.getFolderById(folderId);
  
  try {
    var params = e.parameter;
    var secretKey = params.key;
    var filename = params.filename; // Specific file name if provided
    
    if (secretKey !== ExpectedKey) {
      return ContentService.createTextOutput(JSON.stringify({"status": "error", "message": "Unauthorized"}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (filename) {
      // Get the content of a specific file
      var files = folder.getFilesByName(filename);
      if (files.hasNext()) {
        var file = files.next();
        var content = file.getBlob().getDataAsString();
        return ContentService.createTextOutput(JSON.stringify({"status": "success", "data": content}))
          .setMimeType(ContentService.MimeType.JSON);
      } else {
        return ContentService.createTextOutput(JSON.stringify({"status": "error", "message": "File not found"}))
          .setMimeType(ContentService.MimeType.JSON);
      }
    } else {
      // Get the list and content of all files
      var files = folder.getFiles();
      var fileList = [];
      
      while (files.hasNext()) {
        var file = files.next();
        var content = file.getBlob().getDataAsString(); // Get file content
        fileList.push({
          name: file.getName(),
          lastUpdated: file.getLastUpdated().toISOString(),
          content: content  // Add file content to the result
        });
      }
      
      return ContentService.createTextOutput(JSON.stringify({"status": "success", "files": fileList}))
        .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({"status": "error", "message": error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

3. **Deploy the Project:**
   - Click on the “Deploy” button and select “New deployment”.
   - Choose “Web app” and fill in the necessary information.
   - Set "Who has access" to "Anyone".

4. **Use the API:**
   - The API has two main methods: `doPost` and `doGet`.
     - `doPost`: Used to upload JSON files to Google Drive.
     - `doGet`: Used to retrieve a list of files or the content of a specific file from Google Drive.
   - Ensure to pass the correct `FolderName` and `ExpectedKey` when using the API.

### Notes:
- Replace `FolderName` and `ExpectedKey` with the appropriate values.
- Ensure the storage folder is created in Google Drive.

Sure! Here is the additional instruction in English:

### Get API Link and ExpectedKey

1. **Get API Link:**
   - After deploying the Appscript project, you will receive the API link from the "Deployments" section.
   - Copy that link and save it for use.

2. **Get ExpectedKey:**
   - Use the `ExpectedKey` that you defined in the Appscript code. In the example code, the `ExpectedKey`

### Replace `cloudUrl` and `secretKey` in the extension

1. **Open `popup.js` File:**
   - Navigate to the `assets` folder in your extension and open the `popup.js` file.

2. **Replace `cloudUrl` and `secretKey`:**
   - Find and replace the value of `cloudUrl` with the API link you obtained in the previous step.
   - Find and replace the value of `secretKey` with your `ExpectedKey`.

```javascript
const cloudUrl = "YOUR_API_LINK_HERE"; // Replace with your API link
const secretKey = "YOUR_SECRET_HERE"; // Replace with your ExpectedKey
```

3. **Uncomment the Functions `fetchFromCloud` and `uploadToDrive`:**
   - Scroll to the bottom of the `popup.js` file.
   - Find the `fetchFromCloud` and `uploadToDrive` functions, and remove any comment symbols (`//`) to uncomment them.

```javascript
async function fetchFromCloud() {
  // Function content
}

async function uploadToDrive() {
  // Function content
}
```

### Save and Test

- After making these changes, save the `popup.js` file.
- Restart your extension and verify that the functionalities are working correctly.

Good luck!
