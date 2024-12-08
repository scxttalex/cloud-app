// URIs of the REST endpoints
const RAI = "https://prod-160.westus.logic.azure.com/workflows/a377e2052039456996ff1efd2487a960/triggers/When_a_HTTP_request_is_received/paths/invoke/rest/v1/media?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=UYAm8mT54Q9l9umycEuALLWcvs_4dwFrfvgP5EMDhFI";
const RPP1 = "https://prod-150.westus.logic.azure.com/workflows/bd173af800d048f883b781c73e25bf93/triggers/When_a_HTTP_request_is_received/paths/invoke/rest/v1/users/";
const RPP2 = "?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=37qB81kwtOYXzmHW4BlJWvRfIBa32x8Ck7NicJyX15g";
// Blob Storage Account URL
const BLOB_ACCOUNT = "https://tftblobstorage.blob.core.windows.net";

// Handlers for button clicks
$(document).ready(function () {
  $("#retImages").click(function () {
    getImages();
  });

  $("#subNewPost").click(function () {
    submitNewPost();
  });

  $("#signUp").click(function () {
    signup();
  });

  $("#logIn").click(function () {
    login();   
  });

  $("#updateUser").click(function () {
    updateProfile();   
  });

});

window.onload = function(){
  getImages();
}

function signup() {
  const email = document.getElementById('signupEmail').value;
  const userName = document.getElementById('signupUserName').value;
  const password = document.getElementById('signupPassword').value;

  if (userName && password) {
    const userData = {
      Email: email,
      Username: userName,
      PasswordHash: password,
    };

    const logicAppUrl = 'https://prod-09.uksouth.logic.azure.com/workflows/8ba63c52233b481eb4fc3036b56ff83b/triggers/When_a_HTTP_request_is_received/paths/invoke/rest/v1/users?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=krSZLoe7tzR57_FQv-419ei25d-RTyFfL6QOmii3SP8';

    fetch(logicAppUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })
    .then(response => response.text())
    .then(text => {
      const userID = parseInt(text, 10);
      if (userID) {
        sessionStorage.setItem('userID', userID);
        sessionStorage.setItem('userName', userName);
        sessionStorage.setItem('profilePicture', "path/to/default/profile/pic.jpg");

        alert(`Welcome, ${userName}! Your account has been created successfully.`);
        closeSignupForm();
        updateHeaderUI(); // Update UI after successful signup
      } else {
        throw new Error("Invalid UserID returned in the response.");
      }
    })
    .catch(error => {
      alert('There was an error with the signup process: ' + error.message);
    });
  } else {
    alert('Please enter both username and password.');
  }
}

function login() {
  const userName = document.getElementById('loginUserName').value;
  const password = document.getElementById('loginPassword').value;

  if (userName && password) {
    if (sessionStorage.getItem('userName')) {
      alert(`Welcome back, ${sessionStorage.getItem('userName')}!`);
      return; // Stop further execution if already logged in
    }

    const loginApi = "https://prod-26.uksouth.logic.azure.com:443/workflows/79b1b7b5b8714c7587e3247d7da802c9/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=Vz8uyGIMOLd7I3pF-ryUbbfTz_sNnF_2KlvgnYhR02I";

    const loginData = {
      Username: userName,
      PasswordHash: password,
    };

    fetch(loginApi, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    })
    .then(response => response.json())
    .then(data => {
      if (data.ResultSets && data.ResultSets.Table1 && data.ResultSets.Table1.length > 0) {
        const user = data.ResultSets.Table1[0];

        sessionStorage.setItem('userID', user.UserID);
        sessionStorage.setItem('userName', user.Username);
        sessionStorage.setItem('profilePicture', user.ProfilePicture || 'defaultProfilePic.jpg');

        closeLoginForm();
        updateHeaderUI(); // Update UI after successful login
      } else {
        throw new Error("Invalid credentials or user not found.");
      }
    })
    .catch(error => {
      alert('There was an error with the login process: ' + error.message);
    });
  } else {
    alert('Please enter both username and password.');
  }
}

// Function to show the Account Management overlay
function toggleManageForm() {
  // Load the profile picture and username from sessionStorage
  const profilePic = sessionStorage.getItem('profilePicture');
  const userName = sessionStorage.getItem('userName');
  
  // If the profile picture exists in sessionStorage, use it, otherwise use a placeholder
  const profilePicUrl = profilePic ? profilePic : 'profile-placeholder.jpg';
  
  // Set the profile picture in the overlay preview
  document.getElementById('profilePicPreview').src = profilePicUrl;
  
  // Dynamically update the label text to the username from sessionStorage
  const userNameLabel = document.getElementById('userNameLabel');
  userNameLabel.innerText = `${userName ? userName : 'N/A'}`;

  // Show the overlay
  document.getElementById('manageOverlay').style.display = 'flex';
}


// Function to handle image preview when the user selects a file
function previewProfilePic(event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  // Once the file is read, display it in the preview image element
  reader.onload = function(e) {
    document.getElementById('profilePicPreview').src = e.target.result;
  }

  if (file) {
    reader.readAsDataURL(file); // Read the image as a Data URL to preview it
  }
}

async function updateProfile() {
  // Define the API URLs
  let ImageUploadAPI = "https://prod-05.westus.logic.azure.com/workflows/8032c44da2d24b3b9d0030036235fc6a/triggers/When_a_HTTP_request_is_received/paths/invoke/rest/v1/users?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=fLGSywQk4YnJ0VKldafr29rNej_edbQJnQqP096AXWY";
  let InsertProfileAPI = "https://prod-28.westus.logic.azure.com/workflows/9e8d9b99896b4c16a38e999d7c5546e8/triggers/When_a_HTTP_request_is_received/paths/invoke/rest/v1/users/";

  try {
      // Get the uploaded profile picture file
      const fileInput = document.getElementById('profilePicUpload');
      const file = fileInput.files[0];
      let profilePictureUrl = "";

      if (file) {
          // Log the file to check if it's selected
          console.log("Selected file:", file);

          // Prepare FormData to send the file
          let formData = new FormData();
          formData.append('File', file);  // Use 'File' as the form data key

          // Log FormData contents to debug
          console.log("FormData appended:", formData);

          console.log("Uploading profile picture...");

          // Upload the profile picture
          const uploadResponse = await fetch(ImageUploadAPI, {
              method: 'POST',
              body: formData,
              enctype: 'multipart/form-data',
          });

          if (!uploadResponse.ok) {
              throw new Error("Profile picture upload failed");
          }

          // Get the URL of the uploaded profile picture (e.g., "/media/bruh.jpeg")
          profilePictureUrl = await uploadResponse.text();
          console.log("Profile picture upload response:", profilePictureUrl); 
      } else {
          console.error("No file selected.");
      }

      // Prepare the user data to update the profile
      let userId = sessionStorage.getItem('userID');
      let updateProfileUrl = InsertProfileAPI + userId + "?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=p2I3g_C1XLwhw1_HtrGqHQs7KQ-iOJq6x2eANmAyEEM";
      
      // Concatenate the BLOB_ACCOUNT URL with the uploaded profile picture path
      let updatedProfilePictureUrl = BLOB_ACCOUNT + profilePictureUrl; // Combine the base URL with the path

      // Construct the data object for the API call
      let updateData = {
          ProfilePicture: updatedProfilePictureUrl // Use the combined URL
      };

      console.log("Sending profile update:", updateData);

      // Make the PUT request to insert the profile picture URL into the user's profile
      const profileUpdateResponse = await fetch(updateProfileUrl, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
      });

      if (!profileUpdateResponse.ok) {
          const errorText = await profileUpdateResponse.text();
          console.error("Profile update failed:", errorText);
          throw new Error("Profile update failed");
      }

      // Once the profile is updated successfully, update session storage with the new profile picture URL
      sessionStorage.setItem('profilePicture', updatedProfilePictureUrl);

      // Notify the user that the profile was updated
      alert("Profile picture updated successfully!");

      // Update the profile picture preview in the header
      document.getElementById('profilePicPreview').src = updatedProfilePictureUrl;
      document.getElementById('profilePic').src = updatedProfilePictureUrl;
      updateHeaderUI();
      closeManageForm();
  } catch (error) {
      console.error("Error during profile update:", error);
      alert("Failed to update profile. Please try again.");
  }
}




// Close the Account Management overlay
function closeManageForm() {
  document.getElementById('manageOverlay').style.display = 'none';
}


// Update the UI based on the user's session state
function updateHeaderUI() {
  const userName = sessionStorage.getItem('userName');
  const userID = sessionStorage.getItem('userID');
  const profilePicture = sessionStorage.getItem('profilePicture') || 'bruh.jpg'; // Fallback to default

  // Show or hide login/signup buttons and profile section
  if (userID && userName) {
    document.getElementById('authButtons').style.display = 'none'; // Hide Login/Signup buttons
    document.getElementById('profileSection').classList.remove('hidden'); // Show Profile Section
    document.getElementById('userNameDisplay').innerText = userName;

    // Update profile picture in the header
    const profilePicElement = document.getElementById('profilePic');
    profilePicElement.src = profilePicture;
    profilePicElement.alt = `${userName}'s Profile Picture`; // Optional: Update the alt text

    // Show the Make Post section if logged in
    document.getElementById('Make-Post').classList.remove('hidden');

    // Update profile picture within "Make Post" form
    const makePostPic = document.getElementById('makePostProfilePic');
    makePostPic.src = profilePicture;  // Update the profile picture within the post form
    makePostPic.alt = `${userName}'s Profile Picture`; // Optional: Update the alt text for the post form image

  } else {
    document.getElementById('authButtons').style.display = 'block'; // Show Login/Signup buttons
    document.getElementById('profileSection').classList.add('hidden'); // Hide Profile Section

    // Hide the Make Post section if not logged in
    document.getElementById('Make-Post').classList.add('hidden');
  }
}


// Logout function
function logout() {
  sessionStorage.removeItem('userID');
  sessionStorage.removeItem('userName');
  sessionStorage.removeItem('profilePicture');
  updateHeaderUI(); // Update UI after logout
}

// Event listener for Logout button
document.getElementById('logoutBtn')?.addEventListener('click', function () {
  logout();
});

async function submitNewPost() {
  // Define API URLs
  let ImageUploadAPI = "https://prod-72.westus.logic.azure.com/workflows/fb0f2bb9eea24c4b9ff1538764ed812b/triggers/When_a_HTTP_request_is_received/paths/invoke/rest/v1/posts?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=HZUxnhBgXqEyTebz35jLoPKFBmyxPNeHOOn-YR1TrV4";
  let PostCreationAPI = "https://prod-33.westus.logic.azure.com/workflows/a473d6d0d67849559fb684219795edc2/triggers/When_a_HTTP_request_is_received/paths/invoke/rest/v1/posts?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=Ag8-tNcJpmYaRhdMzXHWqf-dZSeKvNNlrSqdrK6p5pI";

  try {
      // Prepare the image file if present
      const fileInput = $("#upFile")[0];
      let mediaURL = "";

      if (fileInput && fileInput.files && fileInput.files[0]) {
          let imageFile = new FormData();
          imageFile.append('File', fileInput.files[0]);

          console.log("Uploading image...");

          // Upload the image
          const imageUploadResponse = await fetch(ImageUploadAPI, {
              method: 'POST',
              body: imageFile,
              enctype: 'multipart/form-data',
          });

          if (!imageUploadResponse.ok) {
              throw new Error("Image upload failed");
          }

          // Get the response text (not JSON)
          mediaURL = await imageUploadResponse.text();
          console.log("Image upload response:", mediaURL); // Example: /tftmedia/638692593257528671
      }

      // Construct the post object
      let subObj = {
          UserID: sessionStorage.getItem('userID'),
          Username: sessionStorage.getItem('userName'),
          ProfilePicture: sessionStorage.getItem('profilePicture'),
          Content: document.getElementById('postText').value,
          MediaURL: mediaURL // Use the uploaded image URL
      };

      console.log("Creating post with object:", subObj);

      // Create the post
      const postCreationResponse = await fetch(PostCreationAPI, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subObj),
      });

      if (!postCreationResponse.ok) {
          const errorText = await postCreationResponse.text();  // Read as text if not JSON
          console.error("Post creation failed response:", errorText);
          throw new Error("Post creation failed");
      }

      // Check if response is JSON or plain text
      const contentType = postCreationResponse.headers.get('Content-Type');
      let postResult = {};
      if (contentType && contentType.includes('application/json')) {
          postResult = await postCreationResponse.json();  // Parse as JSON if it's JSON
      } else {
          postResult = await postCreationResponse.text();  // Otherwise, treat as plain text
      }

      console.log("Post created successfully:", postResult);
      alert("Post created successfully!");
      getImages();
  } catch (error) {
      console.error("Error during post creation:", error);
      alert("Failed to create post. Please try again.");
  }
}

function getImages() {
  $('#ImageList').html('<div class="spinner-border" role="status"><span class="sr-only"></span></div>');

  // Make a GET request to fetch all posts
  $.getJSON(RAI, function (data) {
    let postsHtmlArray = []; // Array to store HTML for posts
    const postCount = data.length; // Total posts to process
    let processedCount = 0; // Track how many posts have been processed

    // Loop through each post in the returned data
    data.forEach((val, index) => {
      // Extract user information from the post
      const userName = val["Username"] || "Unknown User"; // Assuming 'Username' is now included in the post data
      const profilePic = val["ProfilePicture"] || "profile-pic.jpg"; // Assuming 'ProfilePicture' is now included in the post data
      const createdAt = val["CreatedAt"];
      
      // Format the "time ago" value
      const timeAgoText = createdAt ? getTimeAgo(createdAt) : "Unknown time";

      // Check the full URL for the profile picture
      const profilePicUrl = profilePic;
      console.log("Profile Pic URL:", profilePicUrl); // Debugging to ensure URL is correct

      // Check if the post contains media and determine if it's an image or video
      let mediaContent = '';
      if (val["MediaURL"]) {
        const mediaUrl = BLOB_ACCOUNT + val["MediaURL"];
        // Check media type (image or video)
        getMediaType(mediaUrl).then(mediaType => {
          if (mediaType === 'image') {
            mediaContent = `<img src="${mediaUrl}" alt="Uploaded Content" class="post-image" />`;
          } else if (mediaType === 'video') {
            mediaContent = `<video controls class="post-video" width="100%">
              <source src="${mediaUrl}" type="video/mp4">Your browser does not support the video tag.
            </video>`;
          }

          // Add HTML for this post with media content
          postsHtmlArray[index] = `
            <div class="post">
              <div class="profile-pic-container">
                <img src="${profilePicUrl}" alt="User Profile Picture">
              </div>
              <div class="post-content">
                <div class="post-header">
                  <div class="post-info">
                    <strong>${userName}</strong>
                    <span>@user${val["UserID"] || "N/A"}</span>
                    <span>${timeAgoText}</span>
                  </div>
                </div>
                <p>${val["Content"] || ""}</p>
                ${mediaContent} <!-- Media content (image or video) -->
              </div>
            </div>
          `;
          
          processedCount++;

          // Once all posts are processed, update the HTML
          if (processedCount === postCount) {
            $('#ImageList').html(postsHtmlArray.join("")); // Combine all posts and set HTML
          }
        });
      } else {
        // No media in the post
        postsHtmlArray[index] = `
          <div class="post">
            <div class="profile-pic-container">
              <img src="${profilePicUrl}" alt="User Profile Picture">
            </div>
            <div class="post-content">
              <div class="post-header">
                <div class="post-info">
                  <strong>${userName}</strong>
                  <span>@user${val["UserID"] || "N/A"}</span>
                  <span>${timeAgoText}</span>
                </div>
              </div>
              <p>${val["Content"] || ""}</p>
            </div>
          </div>
        `;
        
        processedCount++;

        // Once all posts are processed, update the HTML
        if (processedCount === postCount) {
          $('#ImageList').html(postsHtmlArray.join("")); // Combine all posts and set HTML
        }
      }
    });
  }).fail(function () {
    $('#ImageList').html('<p class="text-danger">Failed to load posts. Please try again later.</p>');
  });
}




// Function to check the media type of a file by inspecting its MIME type
function getMediaType(url) {
  return fetch(url, { method: 'HEAD' })
    .then(response => {
      const contentType = response.headers.get('Content-Type');
      
      // Check if it's an image or video based on Content-Type
      if (contentType) {
        if (contentType.startsWith('image/')) {
          return 'image'; // If it's an image
        } else if (contentType.startsWith('video/')) {
          return 'video'; // If it's a video
        }
      }
      return null; // If it can't be determined
    })
    .catch(() => null); // Return null if there's an error fetching the headers
}




function fetchMyPosts() {
  const MY_POSTS_API1 = "https://prod-82.westus.logic.azure.com/workflows/5aa598b5febc4857b30e4364b8d70272/triggers/When_a_HTTP_request_is_received/paths/invoke/rest/v1/posts/";
  const MY_POSTS_API2 = "?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=UQLzs-8Yo6sphC5XEdKdDozXAoD5t3Bn0-OZ7rS7w8Q"
  const userId = sessionStorage.getItem('userID'); // Get the logged-in user's ID

  // Show a loading indicator
  const myPostsList = document.getElementById('myPostsList');
  myPostsList.innerHTML = '<div class="spinner-border" role="status"><span class="sr-only"></span></div>';

  // Fetch "My Posts" data
  fetch(`${MY_POSTS_API1}${userId}${MY_POSTS_API2}`)
    .then(response => response.json())
    .then(data => {
      if (data.length > 0) {
        const postsHtmlPromises = data.map(post => {
          const profilePicUrl = post.ProfilePicture || 'defaultProfilePic.jpg';
          const userName = post.Username || 'Unknown User';
          const timeAgoText = getTimeAgo(post.CreatedAt);

          // Check if post has media and determine its type
          let mediaContent = '';
          if (post.MediaURL) {
            return getMediaType(BLOB_ACCOUNT + post.MediaURL).then(mediaType => {
              if (mediaType === 'image') {
                mediaContent = `<img src="${BLOB_ACCOUNT + post.MediaURL}" alt="Uploaded Content" class="post-image" />`;
              } else if (mediaType === 'video') {
                mediaContent = `<video controls class="post-video" width="100%"><source src="${BLOB_ACCOUNT + post.MediaURL}" type="video/mp4">Your browser does not support the video tag.</video>`;
              }
              return `
                <div class="post" id="post-${post.PostID}">
                  <div class="profile-pic-container">
                    <img src="${profilePicUrl}" alt="User Profile Picture">
                  </div>
                  <div class="post-content">
                    <div class="post-header">
                      <div class="post-info">
                        <strong>${userName}</strong>
                        <span>@user${post.UserID || "N/A"}</span>
                        <span>${timeAgoText}</span>
                      </div>
                    </div>
                    <p>${post.Content || ""}</p>
                    ${mediaContent} <!-- Video or Image -->
                    <button class="delete-post-btn" onclick="deletePost(${post.PostID})">X</button>
                  </div>
                </div>
              `;
            });
          } else {
            // If no media, return the post without it
            return Promise.resolve(`
              <div class="post" id="post-${post.PostID}">
                <div class="profile-pic-container">
                  <img src="${profilePicUrl}" alt="User Profile Picture">
                </div>
                <div class="post-content">
                  <div class="post-header">
                    <div class="post-info">
                      <strong>${userName}</strong>
                      <span>@user${post.UserID || "N/A"}</span>
                      <span>${timeAgoText}</span>
                    </div>
                  </div>
                  <p>${post.Content || ""}</p>
                  <button class="delete-post-btn" onclick="deletePost(${post.PostID})">X</button>
                </div>
              </div>
            `);
          }
        });

        // Wait for all the promises to resolve and then update the DOM
        Promise.all(postsHtmlPromises).then(postsHtml => {
          myPostsList.innerHTML = postsHtml.join('');
        });
      } else {
        myPostsList.innerHTML = '<p>No posts found.</p>';
      }
    })
    .catch(error => {
      console.error('Error fetching my posts:', error);
      myPostsList.innerHTML = '<p class="text-danger">Failed to load your posts. Please try again later.</p>';
    });
}



function getTimeAgo(timestamp) {
  const now = new Date();
  const diff = now - new Date(timestamp);
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return `${days} days ago`;
}

function deletePost(postId) {
  const confirmation = confirm('Are you sure you want to delete this post?');
  if (confirmation) {
      // Corrected API endpoint with postId dynamically inserted
      const DELETE_POST_API = `https://prod-26.westus.logic.azure.com/workflows/a1d5d81b40e941c9bf34c249d534cd22/triggers/When_a_HTTP_request_is_received/paths/invoke/rest/v1/posts/${postId}?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=fdQjaWCXA5WSm-s-2NKW-j_UdHwdMFYCpTCYDH-KK64`;

      fetch(DELETE_POST_API, {
          method: 'DELETE',
          headers: {
              'Content-Type': 'application/json',
          },
      })
      .then(response => {
          // Check if the response was successful (status code 200-299)
          if (response.ok) {
              // Remove the post element from the DOM
              const postElement = document.getElementById(`post-${postId}`);
              if (postElement) {
                postElement.remove();
              }
              alert('Post deleted successfully!');
          } else {
              alert('Failed to delete post. Please try again.');
          }
      })
      .catch(error => {
          console.error('Error deleting post:', error);
          alert('Error deleting post. Please try again later.');
      });
  }
}











