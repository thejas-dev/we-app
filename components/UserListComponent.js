
import {Modal,View,Text,Pressable,FlatList,Image} from 'react-native';
import {useState,useEffect} from 'react';
import axios from 'axios';
import {getUsersById} from '../utils/ApiRoutes';
import {profileImage} from '../utils/imageEncoded';

export default function UserListComponent({
	usersInSpace,setOpenUsersTab,openUsersTab
}) {
	const [users,setUsers] = useState([]);

	const fetchUsers = async(id) => {
		const {data} = await axios.post(getUsersById,{id});
		if(data?.status){
			setUsers(data?.user);
		}
	}

	useEffect(()=>{
		if(usersInSpace.length > 0) {
			fetchUsers(usersInSpace);
		}
	},[usersInSpace])

	return (
		<Modal
        animationType="slide"
        transparent={true}
        visible={openUsersTab}
        className="z-0"
        onRequestClose={() => {
          setOpenUsersTab(!openUsersTab);
        }}>
        	<View className="h-[40%] w-full">
        		<Pressable className="h-full w-full" onPress={()=>{setOpenUsersTab(false)}}>

        		</Pressable>
        	</View>
					<View className={`bg-black/80 h-[60%] mt-auto w-full rounded-t-2xl p-5 py-4 pb-0 flex `}>
	        	<Pressable onPress={()=> setOpenUsersTab(!openUsersTab)}>
					<View className="w-full my-3 flex items-center justify-center">
						<View className="rounded-full bg-gray-200 h-[6px] w-[100px]"/>
					</View>
				</Pressable>
				<Text className="text-xl mb-0 mt-4 font-bold text-white">
					People in Space
				</Text>
				<FlatList data={users}
				keyExtractor={item => item?._id}
				ListFooterComponent={()=>(
					<View className="my-3"/>
				)}
				renderItem={({item,index})=>(
					<View className="flex flex-row px-3 py-2 mt-4 rounded-lg border-[1px] 
					border-gray-600 bg-black/60 items-center">
						<Image source={{
							uri:item?.image || profileImage?.uri,
							height:5,
							width:5
						}} className="h-[30px] w-[30px] rounded-full"/>
						<Text className="text-lg ml-3 font-semibold text-gray-100">
							{item?.name}
						</Text>
					</View>
				)}/>
			</View>

		</Modal>
	)
}