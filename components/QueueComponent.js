import {Modal,View,Text,Pressable,FlatList,Image} from 'react-native';
import {useState,useEffect} from 'react';
import axios from 'axios';

export default function QueueComponent({
	queue,setQueue,openQueueTab,setOpenQueueTab,
	musicImage
}) {

	return (
		<Modal
        animationType="slide"
        transparent={true}
        visible={openQueueTab}
        className="z-0"
        onRequestClose={() => {
          setOpenQueueTab(!openQueueTab);
        }}>
        	<View className="h-[20%] w-full">
        		<Pressable className="h-full w-full" onPress={()=>{setOpenQueueTab(false)}}>

        		</Pressable>
        	</View>
			<View className={`bg-black/80 h-[80%] mt-auto w-full 
			rounded-t-2xl p-5 py-4 pb-0 flex border-t-[1px] border-x-[0.2px] border-gray-500`}>
	        	<Pressable onPress={()=> setOpenQueueTab(!openQueueTab)}>
					<View className="w-full my-3 flex items-center justify-center">
						<View className="rounded-full bg-gray-200 h-[6px] w-[100px]"/>
					</View>
				</Pressable>
				<Text className="text-xl mb-0 mt-2 font-bold text-white">
					Currently Playing
				</Text>
				<View className="flex flex-row px-3 py-2 mt-4 rounded-lg border-[1px] 
				border-gray-600 bg-black/60 items-center">
					<Image source={{
						uri:queue[0]?.info?.videoDetails?.thumbnails?.[3]?.url || queue[0]?.cover || musicImage?.uri,
						height:5,
						width:5
					}} className="h-[40px] w-[40px] rounded-md"/>
					<Text numberOfLines={2} className="text-md w-[80%] ml-3 font-semibold text-gray-100">
						{queue[0]?.info?.videoDetails?.title || queue[0]?.title || 'Queue Was Empty'}
					</Text>
				</View>
				<Text className="text-xl mb-0 mt-4 font-bold text-white">
					Upcoming Songs
				</Text>
				<FlatList data={[...queue].slice(1)}
				keyExtractor={(contact, index) => String(index)}
				ListFooterComponent={()=>(
					<View className="my-3"/>
				)}
				renderItem={({item,index})=>(
					<View className="flex flex-row px-3 py-2 mt-4 rounded-lg border-[1px] 
					border-gray-600 bg-black/60 items-center">
						<Image source={{
							uri:item?.info?.videoDetails?.thumbnails?.[3]?.url || item?.cover || musicImage?.uri,
							height:5,
							width:5
						}} className="h-[40px] w-[40px] rounded-md"/>
						<Text numberOfLines={2} className="text-md w-[80%] ml-3 font-semibold text-gray-100">
							{item?.info?.videoDetails?.title || item?.title}
						</Text>
					</View>
				)}/>

			</View>

		</Modal>
	)
}