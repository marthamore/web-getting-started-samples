/* Add click handlers to call your helper functions */
document.getElementById("csdk-logout").addEventListener('click', handleCsdkLogout, false);
document.getElementById("upload-cc-file").addEventListener('click', uploadFile, false);
document.getElementById("get-cc-folder-assets").addEventListener('click', getCCFolderAssets, false);


/* Initialize the AdobeCreativeSDK object */
AdobeCreativeSDK.init({
    /* Add your Client ID (API Key) */
    clientID: CONFIG.CSDK_CLIENT_ID,
    onError: function(error) {
        /* Handle any global or config errors */
        if (error.type === AdobeCreativeSDK.ErrorTypes.AUTHENTICATION) { 
            /* 
            	Note: this error will occur when you try 
                to launch a component without checking if 
            	the user has authorized your app. 
            	
            	From here, you can trigger 
                AdobeCreativeSDK.loginWithRedirect().
            */
            console.log('You must be logged in to use the Creative SDK');
        } else if (error.type === AdobeCreativeSDK.ErrorTypes.GLOBAL_CONFIGURATION) { 
            console.log('Please check your configuration');
        } else if (error.type === AdobeCreativeSDK.ErrorTypes.SERVER_ERROR) { 
            console.log('Oops, something went wrong');
        }
    }
});


/* Make a helper function */
function handleCsdkLogin() {

    /* Get auth status */
    AdobeCreativeSDK.getAuthStatus(function(csdkAuth) {

        /* Handle auth based on status */
        if (csdkAuth.isAuthorized) {
            // The user is logged in and has authorized your site. 
            console.log('Logged in!');
        } else {
            // Trigger a login
            AdobeCreativeSDK.login(handleCsdkLogin);
        }
    });
}

/* Make a helper function */
function handleCsdkLogout() {

    /* Get auth status */
    AdobeCreativeSDK.getAuthStatus(function(csdkAuth) {

        /* Handle auth based on status */
        if (csdkAuth.isAuthorized) {
            AdobeCreativeSDK.logout();
            console.log('Logged out!');
        } else {
            console.log('Not logged in!');
        }

    });
}

/* Make a helper function */
function uploadFile() {

    AdobeCreativeSDK.getAuthStatus(function(csdkAuth) {

        /* 1) Get the first element from the FileList */
        var file = document.getElementById("fileItem").files[0];
        var uploadResultIndicator = document.getElementById("upload-result-indicator");

        /* 2) If the user is logged in AND their browser can upload */
        if (csdkAuth.isAuthorized && AdobeCreativeSDK.API.Files.canUpload()) {

            /* 3) Make a params object to pass to Creative Cloud */
            var params = {
                data: file,
                folder: "My CSDK App test",
                overwrite: false
            }

            /* 4) Upload, handling error and success in your callback */
            AdobeCreativeSDK.API.Files.upload(params, function(result) {
                if (result.error) {
                    console.log(result.error);
                    uploadResultIndicator.innerHTML = "Upload error!";
                    window.setTimeout(clearUploadStatus, 2000);
                    return;
                }

                // Success
                console.log(result.file);
                uploadResultIndicator.innerHTML = "Uploaded!"
                window.setTimeout(clearUploadStatus, 2000);
            });
        } else {
            // User is not logged in, trigger a login
            handleCsdkLogin();
        }

        function clearUploadStatus() {
            uploadResultIndicator.innerHTML = "";
        }
    });
}

/* Make a helper function */
function getCCFolderAssets() {



    AdobeCreativeSDK.getAuthStatus(function(csdkAuth) {

        var folderContentsDiv = document.getElementById("folder-contents");
        clearFolderContentsDiv();

        if (csdkAuth.isAuthorized) {

            /* 1) Make a params object to pass to Creative Cloud */
            var params = {
                path: "/files/My CSDK App test" // defaults to root if not set
            }

            /* 2) Request an array of assets from Creative Cloud */
            AdobeCreativeSDK.API.Files.getAssets(params, function(result) {
                if (result.error) {
                    console.log(result.error);
                    return;
                }

                if (result.data.length === 0) {
                    showEmptyFolderMessage();
                }

                // Success, an array of assets
                addDownloadButtonsToDOM(result.data);                
            });
        }
        else {
            // User is not logged in, trigger a login
            handleCsdkLogin();
        }

        function showEmptyFolderMessage() {
            var p = document.createElement('p');
            p.innerHTML = "Nothing in the \"My CSDK App test\" folder. Try uploading something first.";

            folderContentsDiv.appendChild(p);
        }

        function clearFolderContentsDiv() {
            folderContentsDiv.innerHTML = "";
        }

        function addDownloadButtonsToDOM(assetArray) {
            for (let i = 0; i < assetArray.length; i++) {
                // Create elements to be appended to DOM
                var div = document.createElement('div');
                var button = document.createElement('button');
                var span = document.createElement('span');

                var fileName = assetArray[i].name;
                var fileSize = assetArray[i].fileSize;

                button.innerHTML = "Download " + fileName;
                span.innerHTML = " " + Math.round(fileSize/1024) + " KB";

                /* Attach click handlers to buttons */
                (function addListener(path, fileName) {

                    var fullPath = params.path + "/" + fileName;

                    button.addEventListener('click', function(){downloadCCAssetRendition(fullPath)}, false);

                })(params.path, fileName)

                // Append elements to DOM
                div.appendChild(button);
                div.appendChild(span);
                folderContentsDiv.appendChild(div);
            }
        }
    });
}

/* Make a helper function */
function downloadCCAssetRendition(filePath) {

    AdobeCreativeSDK.getAuthStatus(function(csdkAuth) {

        if (csdkAuth.isAuthorized) {

            /* 1) Make a params object to pass to Creative Cloud */
            var params = {
                path: filePath,
                type: AdobeCreativeSDK.Constants.Asset.RenditionType.JPEG
            }

            /* 2) Request an asset rendition from Creative Cloud */
            AdobeCreativeSDK.API.Files.getRendition(params, function(result) {
                if (result.error) {
                    console.log(result.error);
                    return;
                }

                // Success, attach the downloaded image to the DOM element
                var imageElement = document.getElementById("downloaded-cc-rendition");
                imageElement.src = result.data;
            });

        }
        else {
            // User is not logged in, trigger a login
            handleCsdkLogin();
        }
    });
}