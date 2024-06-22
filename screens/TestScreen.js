import {View} from 'react-native';
import {useState,useEffect} from 'react';
import TrackPlayer, { Capability, State } from 'react-native-track-player';
import axios from 'axios';

export default function TestScreen({
	navigation
}) {

	const resetPlayer = async() => {
		await TrackPlayer.setupPlayer();
		await TrackPlayer.reset();

	}
	

	const initPlayer = async() => {
		console.log("called")
		await TrackPlayer.setupPlayer();
		await TrackPlayer.updateOptions({
		    // Media controls capabilities
		    capabilities: [
		        Capability.Play,
		        Capability.Pause,
		        Capability.SkipToNext,
		        Capability.SkipToPrevious,
		        Capability.Stop,
		    ],

		    // Capabilities that will show up when the notification is in the compact form on Android
		    compactCapabilities: [Capability.Play, Capability.Pause,Capability.SkipToNext,
		       Capability.SkipToPrevious,],

		});
		await TrackPlayer.reset();
		const {data} = await axios.post('http://192.168.1.9:3333/getAudio',{
			url:'https://www.youtube.com/watch?v=fRD_3vJagxk'
		});
		// console.log(data)
		const track1 = {
		    url: data?.url,
		    title: data?.info?.videoDetails?.title,
		    artist: data?.info?.videoDetails?.author?.name,
		    album: data?.info?.videoDetails?.author?.name,
		    duration:data?.info?.videoDetails?.lengthSeconds,
		    date:data?.info?.videoDetails?.publishDate?.split("T")[0],
		    id:data?.info?.videoDetails?.videoId,
		};
		await TrackPlayer.add(track1);
		let trackIndex = await TrackPlayer.getCurrentTrack();
		let trackObject = await TrackPlayer.getTrack(trackIndex);
		console.log(`Title: ${trackObject?.duration}`);
		const position = await TrackPlayer.getPosition();
		// const duration = await TrackPlayer.getDuration();
		console.log(`${trackObject?.duration - position} seconds left.`);
		await TrackPlayer.play();
		const state = await TrackPlayer.getState();
		console.log(state)
		const tracks = await TrackPlayer.getQueue();
		console.log(`First title: ${tracks}`);
		if (state === State.Playing) {
		    console.log('The player is playing');
		};
		setTimeout(async()=>{
			const state = await TrackPlayer.getState();
			console.log(state)
		},5000);
	}

	const checkState = async() => {
		const state = await TrackPlayer.getState();
		console.log(state)
	}

	useEffect(()=>{
		// initPlayer();
		resetPlayer();
		// setInterval(()=>{
		// 	// checkState()
		// },2000)
	},[])
	

	return (
		<View>

		</View>
	)
}