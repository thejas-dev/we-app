
import {View,Text,Modal,Pressable,TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {useState,useEffect} from 'react';

export default function MoreOptionsComponent({
	openMoreOptions,setOpenMoreOptions,syncYoutubePosition,
	currentUser,currentSpace
}) {
	const [deleteConfirm,setDeleteConfirm] = useState(false);

	useEffect(()=>{
		if(!openMoreOptions){
			setDeleteConfirm(false);
		}
	},[openMoreOptions])

	return (
		<Modal
        animationType="slide"
        transparent={true}
        visible={openMoreOptions}
        className="z-0"
        onRequestClose={() => {
          setOpenMoreOptions(!openMoreOptions);
        }}>
        	<View className={`${currentSpace?.users?.[0]?._id === currentUser?._id ? 'h-[78%]' : 'h-[85%]'}  w-full`}>
        		<Pressable className="h-full w-full" onPress={()=>{setOpenMoreOptions(false)}}>

        		</Pressable>
        	</View>
        	<View className={`bg-black/80 ${currentSpace?.users?.[0]?._id === currentUser?._id ? 'h-[22%]' : 'h-[15%]'}  
        	w-full rounded-t-2xl py-4 pb-0 flex border-t-[1px] border-x-[0.2px] 
        	relative border-gray-500`}>
				
	        	<Pressable onPress={()=> setOpenMoreOptions(!openMoreOptions)}>
					<View className="w-full my-2 flex items-center justify-center">
						<View className="rounded-full bg-gray-200 h-[6px] w-[100px]"/>
					</View>
				</Pressable>
				<View className="mt-3 border-t-[1px] flex flex-col justify-between border-solid border-gray-600">
					<TouchableOpacity onPress={()=>{syncYoutubePosition();setOpenMoreOptions(false)}}
					>
						<View className="flex flex-row py-4 items-center justify-between px-5">
							<Text className="text-xl text-gray-100 font-semibold" >Sync Now</Text>
							<Icon name="refresh" size={25} color="white"/>
						</View>
					</TouchableOpacity>
					{
						currentSpace?.users?.[0]?._id === currentUser?._id &&
						<TouchableOpacity onPress={()=>{
							if(!deleteConfirm){
								setDeleteConfirm(true);
							}
						}}
						>
							<View className="flex flex-row py-2 items-center justify-between px-5">
								<Text className="text-xl text-red-500 font-semibold" >
									{
										deleteConfirm ?
										'Confirm ?'
										:
										'Delete The Space'
									}
								</Text>
								<Icon name="trash-o" size={25} color="red"/>
							</View>
						</TouchableOpacity>
					}
				</View>

			</View>

		</Modal>
	)
}