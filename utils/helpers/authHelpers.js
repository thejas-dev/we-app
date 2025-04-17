import AsyncStorage from '@react-native-async-storage/async-storage';
import StorageConstants from "../storageConstants";

export const getAuthTokens = async() => {
    const localData = await AsyncStorage.getItem(StorageConstants.userTokens);
    if(localData){
        const {accessToken,refreshToken} = JSON.parse(localData)
        return {accessToken,refreshToken};
    }else{
        return {accessToken: '', refreshToken: ''};
    }
}

export const setAuthTokens = async(accessToken,refreshToken) => {
    await AsyncStorage.setItem(
        StorageConstants.userTokens, 
        JSON.stringify({accessToken, refreshToken})
    );
}

export const getUserSession = async() => {
    const localData = await AsyncStorage.getItem(StorageConstants.userSession);
    if(localData){
        const user = JSON.parse(localData)
        return user;
    }else{
        return '';
    }
}

export const setUserSession = async(currentUser) => {
    await AsyncStorage.setItem(StorageConstants.userSession,JSON.stringify(currentUser));
}

export const clearTokens = async() => {
    await AsyncStorage.removeItem(StorageConstants.userTokens);
    await AsyncStorage.removeItem(StorageConstants.userSession);
}



