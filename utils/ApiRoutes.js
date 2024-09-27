export const host = "https://weapp-server.vercel.app"
// "http://192.168.1.4:3333"; 
// "https://weapp-server.onrender.com" 
// "http://192.168.1.3:3333"; 


export const registerRoute = `${host}/api/auth/register`;
export const login = `${host}/api/auth/login`;
export const createSpace = `${host}/api/auth/createSpace`;
export const getSpaceWithCode = `${host}/api/auth/getSpaceWithCode`;
export const getAllPublicSpace = `${host}/api/auth/getAllPublicSpace`;
export const updateInSpace = `${host}/api/auth/updateInSpace`;
export const updateUsersInSpace = `${host}/api/auth/updateUsersInSpace`;
export const getUserById = `${host}/api/auth/getUserById`;
export const getAudio = `${host}/getAudio`;
export const getUsersById = `${host}/api/auth/getUsersById`;
export const getQueueOfSpace = `${host}/getQueueOfSpace`;
export const updateFavSong = `${host}/api/auth/updateFavSong`;
export const fetchCurrentUserSpaces = `${host}/api/auth/fetchCurrentUserSpaces`;
export const updateUserName = `${host}/api/auth/updateUserName`;
export const profileImageUploadUrl = `${host}/uploadProfile`;