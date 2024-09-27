# WE App - Collaborative Media Platform

## Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Technologies Used](#technologies-used)
- [API Integration](#api-integration)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

## Introduction
**WE App** is a collaborative media platform that allows multiple users to listen to songs and watch videos simultaneously in sync. Users can create public or private spaces and invite others to join, with unlimited participants supported in each space.

## Features
- **Synchronized Playback**: Listen to music or watch videos with friends in real-time.
- **Public and Private Spaces**: Create spaces to share with friends or the public.
- **Unlimited Users**: No limit to the number of users in a space.
- **YouTube API Integration**: Stream media using YouTube’s powerful API.
- **Real-time Chat**: Chat with others while watching or listening together.
- **Profile Customization**: Users can upload their profile picture and customize their presence.
  
## Installation
1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/we-app.git


2. Install the dependencies:
   ```bash
    cd we-app
    npm install

3. Set up environment variables for the backend, including API keys (YouTube, ImageKit, etc.)

4. Start the development server:
    ```bash
    npm start
    ```

## Usage

1. Open the app and sign up or log in.
2. Create a public or private space.
3. Invite users or let them join via the unique code displayed in space.
4. Start streaming music or videos in sync with others.
5. Use the chat feature to communicate while listening or watching together.

## Technology Used

1. **React Native**: For building the mobile app.
2. **Node.js**: Backend server.
3. **Express.js**: REST API development.
4. **Socket.io**: Real-time communication and synchronization.
5. **YouTube API**: For media streaming.
6. **ImageKit**: For handling media uploads and storage.
7. **Multer**: For handling file uploads on the backend.
8. ...


## API Integration
### YouTube API
The app integrates with the YouTube API for streaming videos and music. The YouTube API allows fetching trending videos, specific playlists, or user searches for real-time playback.

### ImageKit
ImageKit is used for storing profile pictures and uploaded songs, allowing fast and secure content delivery via CDN.

## Screenshots
<div style="display:flex; flex-wrap:wrap; width: 100%; background-color: white; justify-content:space-around;row-gap:10px">
    <img src="" alt="Login Screen" style="width:45%">
    <img src="" alt="Register Screen" style="width:45%">
    <img src="https://ik.imagekit.io/d3kzbpbila/thejashari_9FH7ctv7v" alt="Home Screen" style="width:45%">
    <img src="https://ik.imagekit.io/d3kzbpbila/thejashari_GzOsT3p891" alt="Home Screen" style="width:45%">
    <img src="https://ik.imagekit.io/d3kzbpbila/thejashari_wWPq17qZL" alt="Home Screen" style="width:45%">
    <img src="https://ik.imagekit.io/d3kzbpbila/thejashari_KnMK5Nmum" alt="Home Screen" style="width:45%">
    <img src="https://ik.imagekit.io/d3kzbpbila/thejashari_YVSrxyF0U" alt="Home Screen" style="width:45%">
    <img src="https://ik.imagekit.io/d3kzbpbila/thejashari_zNrq7CKPBD" alt="Home Screen" style="width:45%">
    <img src="https://ik.imagekit.io/d3kzbpbila/thejashari_9oemLp_JMl" alt="Home Screen" style="width:45%">
    <img src="https://ik.imagekit.io/d3kzbpbila/thejashari_kEniPymAb" alt="Home Screen" style="width:45%">
</div> 

## Contributing
Contributions are welcome! Please fork the repository and submit a pull request.

## License
This project is licensed under the MIT License.
