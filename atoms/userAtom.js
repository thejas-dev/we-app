
import { atom } from 'recoil';

export const currentUserState = atom({
	key:"currentUserState",
	default:''
})
		// {"_id": "64ea4792b52f77b2175e2f56", "email": "thejaskala308@gmail.com", "favSong": [], "image": "https://ik.imagekit.io/d3kzbpbila/thejashari_dLQ-8qlCL?updatedAt=1694112075788", "inSpace": "", "name": "thejaskala308", "username": "thejaskala308"}

export const playingState = atom({
	key:"playingState",
	default:true
})

export const currentSpaceState = atom({
	key:"currentSpaceState",
	default:''
})

export const songPlayingState = atom({
	key:"songPlayingState",
	default:true
})

export const currentSongInfoState = atom({
	key:"currentSongInfoState",
	default:''
})

export const searchResultState = atom({
	key:"searchResultState",
	default:[]
})

export const searchResult2State = atom({
	key:"searchResult2State",
	default:[]
})

export const newUserDataState = atom({
	key:"newUserDataState",
	default:''
})

export const hideState = atom({
	key:"hideState",
	default:false
})

export const tempNavigationState = atom({
	key:"tempNavigationState",
	default:''
})

export const numberOfUsersState = atom({
	key:"numberOfUsersState",
	default:0
})

export const queueState = atom({
	key:"queueState",
	default:[]
})

export const youtubePlayerState = atom({
	key:"youtubePlayerState",
	default:''
})

export const globalPlayerRefState = atom({
	key:'globalPlayerRefState',
	default:0
})

export const chatsState = atom({
	key:"chatsState",
	default:[]
})

export const newMessageState = atom({
	key:'newMessageState',
	default:''
})