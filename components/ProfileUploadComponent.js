import {View,Text,TouchableOpacity} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';

export default function ProfileUploadComponent({
	uploadProfilePicture,Icon2
}) {

	const selectProfilePicture = () => {
		const options = {
		    mediaType: 'photo',
		    quality: 1,
		};

	  	try{
		  	launchImageLibrary(options, (response) => {
			    if (response.didCancel) {
			      console.log('User cancelled image picker');
			    } else if (response.errorCode) {
			      console.log('Image Picker Error: ', response.errorMessage);
			    } else {
			      const source = {
			        uri: response.assets[0].uri,
			        name: response.assets[0].fileName,
			        type: response.assets[0].type,
			      };
			      uploadProfilePicture(source);
			    }
			});
	  	}catch(ex){
	  		console.log(ex);
	  	}
	}
	
	return (
		<View className="absolute z-50 bottom-2 right-2 rounded-full bg-gray-200/50">
			<TouchableOpacity onPress={()=>{
				selectProfilePicture();
			}} className="p-2" >
				<Icon2 name="add-a-photo" size={22} color="black"/>
			</TouchableOpacity>
		</View>
	)
}