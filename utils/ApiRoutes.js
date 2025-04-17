export const host = 'http://192.168.1.6:3000';
export const host2 = 'http://192.168.1.6:3333';
// 'http://localhost:3333';
// "https://weapp-server.vercel.app"
// "http://192.168.1.4:3333";
// "https://weapp-server.onrender.com"
// "http://192.168.1.3:3333"

export const registerRoute = `/v1/auth/register`;
export const login = `/v1/auth/login`;
export const getUserDetails = `/v1/auth/getUserDetails`;
export const refreshTokenRoute = `/v1/auth/refreshToken`;
export const updateInSpace = `/v1/user/updateInSpace`;
export const getUsersById = `/v1/user/getUsersById`;
export const updateUserName = `/v1/user/updateUserName`;
export const updateFavSong = `/v1/user/updateFavSong`;
export const logoutUser = `${host}/v1/auth/logout`;
export const createSpace = `${host2}/api/auth/createSpace`;
export const getSpaceWithCode = `${host}/api/auth/getSpaceWithCode`;
export const getAllPublicSpace = `${host}/api/auth/getAllPublicSpace`;
export const updateUsersInSpace = `${host}/api/auth/updateUsersInSpace`;
export const getUserById = `${host}/api/auth/getUserById`;
export const getAudio = `${host}/getAudio`;
export const getQueueOfSpace = `${host}/getQueueOfSpace`;
export const fetchCurrentUserSpaces = `${host}/api/auth/fetchCurrentUserSpaces`;
export const profileImageUploadUrl = `${host}/uploadProfile`;
