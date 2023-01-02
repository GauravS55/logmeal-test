var isAdvancedUpload = (function () {
  var div = document.createElement("div");
  return (
    ("draggable" in div || ("ondragstart" in div && "ondrop" in div)) &&
    "FormData" in window &&
    "FileReader" in window
  );
})();

let draggableFileArea = document.querySelector(".drag-file-area");
let browseFileText = document.querySelector(".browse-files");
let uploadIcon = document.querySelector(".upload-icon");
let dragDropText = document.querySelector(".dynamic-message");
let fileInput = document.querySelector(".default-file-input");
let urlInput = document.querySelector(".form__field");
let cannotUploadMessage = document.querySelector(".cannot-upload-message");
let cancelAlertButton = document.querySelector(".cancel-alert-button");
let removeFileButton = document.querySelector(".remove-file-icon");
let uploadButton = document.querySelector(".upload-button");
let urlButton = document.getElementById("url-upload-btn");
let fileFlag = 0;

const ImageUploader = async (files) => {
  let imgObj = {};
  fileInput.files = files;
  var image = new Image();
  let base64Path = await toBase64(files[0]);
  imgObj.filename = files[0].name;
  imgObj.imgSize = (fileInput.files[0].size / 1024).toFixed(1) + "KB";
  let imgwidth = "";
  let imgheight = "";
  image.onload = function () {
    imgwidth = image.width;
    imgObj.width = imgwidth.toString();
    imgheight = image.height;
    imgObj.height = imgheight.toString();
  };
  image.src = base64Path;
  imgObj.base64Img = base64Path;
  console.log(imgObj , 'ppppppppppppppppp');
  return imgObj;
};

fileInput.addEventListener("click", () => {
  fileInput.value = "";
});

urlInput.addEventListener("change", function (e) {
  console.log(e.target.value);
});

urlButton.addEventListener("click", function (e) {
  e.preventDefault();
  let urlVal = urlInput.value;
  if (urlVal !== "") {
    console.log(urlVal, "urlVal");
  } else {
    let formField = document.querySelector(".form__group");
    formField.classList.add("field_error");
    document.querySelector(".form__label").style.color = "#d9534f";
    document.querySelector(".form__field").style.borderBottom =
      "2px solid #d9534f";
    urlInput.focus();
    document.onkeyup = function () {
      if (urlInput.value.length === 0) return;
      formField.classList.remove("field_error");
    };
  }
});
fileInput.addEventListener("change", (e) => {
  uploadIcon.classList.replace("bi-upload", "bi-patch-check-fill");
  dragDropText.innerHTML = "File Dropped Successfully!";
  document.querySelector(
    ".label"
  ).innerHTML = `drag & drop or <span class="browse-files"> <input type="file" class="default-file-input" style=""/> <span class="browse-files-text" style="top: 0;"> browse file</span></span>`;
  uploadButton.innerHTML = `Upload`;
  fileFlag = 0;
});

uploadButton.addEventListener("click", async () => {
  const isFileUploaded = fileInput.value;
  console.log(
    "🚀 ~ file: index.js:76 ~ uploadButton.addEventListener ~ isFileUploaded",
    isFileUploaded
  );
  if (isFileUploaded.length !== 0) {
    let isFileCheck = fileInput.files;
    let imgObj = await ImageUploader(isFileCheck);
    console.log(
      "🚀 ~ file: index.js:78 ~ uploadButton.addEventListener ~ imgObj",
      imgObj 
    );
    console.log(toString(imgObj.width) , 'new-width')
    localStorage.setItem('fileName' , imgObj.filename);
    localStorage.setItem('fileSize' , imgObj.imgSize);
    localStorage.setItem('imgWidth' , imgObj.width);
    localStorage.setItem('imgHeight' , imgObj.height);
 
    
    let base64 = imgObj.base64Img;

    await fetch("http://localhost:5000/upload_image", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ file: base64 }),
    })
      .then((response) => response.json())
      .then((response) => response);

    if (fileFlag == 0) {
      fileFlag = 1;
      var width = 0;
      var id = setInterval(frame, 50);
      function frame() {
        if (width >= 390) {
          clearInterval(id);
          uploadButton.innerHTML = `<span class="material-icons-outlined upload-button-icon"> check_circle </span> Uploaded`;
        }
      }
    }
  } else {
    // cannotUploadMessage.style.cssText = "display: flex; animation: fadeIn linear 1.5s;";
    console.log("------DD");
    uploadIcon.classList.replace("bi-upload", "bi-x-octagon-fill");
    dragDropText.innerHTML = "File not found";
    document.querySelector(
      ".label"
    ).innerHTML = `<span class="browse-files"> <input type="file" class="default-file-input" style=""/> <span class="browse-files-text" > browse file</span> <span>from device</span> </span>`;
  }
});

cancelAlertButton.addEventListener("click", () => {
  cannotUploadMessage.style.cssText = "display: none;";
});

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    if (file) {
      reader.readAsDataURL(file);
    }
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

if (isAdvancedUpload) {
  [
    "drag",
    "dragstart",
    "dragend",
    "dragover",
    "dragenter",
    "dragleave",
    "drop",
  ].forEach((evt) =>
    draggableFileArea.addEventListener(evt, (e) => {
      e.preventDefault();
      e.stopPropagation();
    })
  );
  ["dragover", "dragenter"].forEach((evt) => {
    draggableFileArea.addEventListener(evt, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dragDropText.innerHTML = "Drop your file here!";
      uploadIcon.classList.replace("bi-upload", "bi-download");
      uploadIcon.classList.replace("bi-x-octagon-fill", "bi-download");
      uploadIcon.classList.replace("bi-patch-check-fill", "bi-download");
    });
  });

  draggableFileArea.addEventListener("drop", async (e) => {
    uploadIcon.classList.replace("bi-download", "bi-patch-check-fill");
    dragDropText.innerHTML = "File Dropped Successfully!";
    document.querySelector(
      ".label"
    ).innerHTML = ` <span class="browse-files"> <input type="file" class="default-file-input" style=""/> <span class="browse-files-text" > browse file</span> <span>from device</span> </span>`;
    uploadButton.innerHTML = `Upload`;
    let files = e.dataTransfer.files;
    await ImageUploader(files);
    fileFlag = 0;
  });
} else {
  console.log("-------------");
}


