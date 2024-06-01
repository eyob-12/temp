import { useEffect, useRef, useState } from "react";
import {
	Button,
	Flex,
	Hide,
	SimpleGrid,
	useDisclosure,
	useToast,
} from "@chakra-ui/react";
import { useDispatch, useSelector } from "react-redux";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import {
	nextTrack,
	prevTrack,
	setPlaying,
} from "../../redux/slices/playerSlice";
import { client } from "../../api";
import { setUser } from "../../redux/slices/userSlice";
import VolumeControl from "./VolumeControl";
import TrackDetails from "./TrackDetails";
import PlayControls from "./PlayControls";
import LoginModal from "../LoginModal";
import PlayingBar from "./PlayingBar";
import { setModalMessage } from "../../redux/slices/modalSlice";

const MusicPlayer = () => {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const modalRef = useRef();
	const toast = useToast();
	const dispatch = useDispatch();
	const { currentTrack, repeatStatus, currentIndex, trackList, isPlaying } =
		useSelector((state) => state.player);
	const { user, token } = useSelector((state) => state.user);
	const audioRef = useRef();

	const isEndOfTracklist = currentIndex === trackList.length - 1;

	const [songDetails, setSongDetails] = useState(null);
	const [audioPlaying, setAudioPlaying] = useState(false);

	// Update audioBaseUrl to point to backend route
	const audioBaseUrl = 'http://localhost:4000/api/songs/';

	useEffect(() => {
		if (isPlaying) {
			audioRef.current.play();
			setAudioPlaying(true);
		} else {
			audioRef.current.pause();
			setAudioPlaying(false);
		}
	}, [isPlaying]);

	useEffect(() => {
		if (currentTrack && audioRef.current) {
			audioRef.current.src = audioBaseUrl + currentTrack.filename[0];
			audioRef.current.play();
			dispatch(setPlaying(true));
			setAudioPlaying(true);
		}
	}, [currentTrack]);

	useEffect(() => {
		if (audioRef.current) {
			setSongDetails((prev) => ({
				...prev,
				time: 0,
			}));
			audioRef.current.currentTime = 0;
		}
	}, [currentTrack?._id]);

	const seekPoint = (e) => {
		audioRef.current.currentTime = (e / 100) * audioRef.current.duration;
		setSongDetails((prev) => ({
			...prev,
			time: Math.round(
				(audioRef.current.currentTime / audioRef.current.duration) * 100
			),
		}));
	};

	const changeVolume = (e) => {
		const volume = e / 100;
		setSongDetails((prev) => ({
			...prev,
			volume,
		}));
		audioRef.current.volume = volume;
	};

	const handlePlayPause = () => {
		if (audioPlaying) {
			audioRef.current.pause();
		} else {
			audioRef.current.play();
		}
		setAudioPlaying(!audioPlaying);
		dispatch(setPlaying(!audioPlaying));
	};

	const volumeToggle = () => {
		const newVolume = songDetails?.volume > 0 ? 0 : 1;
		setSongDetails((prev) => ({
			...prev,
			volume: newVolume,
		}));
		audioRef.current.volume = newVolume;
	};

	const handleNextSong = () => {
		if (trackList.length === 1) {
			restartSong();
		} else {
			dispatch(nextTrack());
		}
	};

	const handlePreviousSong = () => {
		if (trackList.length === 1) {
			restartSong();
		} else {
			dispatch(prevTrack());
		}
	};

	const restartSong = () => {
		setSongDetails((prev) => ({
			...prev,
			time: 0,
		}));
		audioRef.current.currentTime = 0;
		audioRef.current.play();
	};

	const handleEnded = () => {
		switch (repeatStatus) {
			case "OFF":
				if (!isEndOfTracklist) {
					handleNextSong();
				}
				break;
			case "TRACKLIST":
				handleNextSong();
				break;
			case "SINGLE":
				audioRef.current.play();
				break;
			default:
				break;
		}
	};

	const likeSong = async () => {
		try {
			const res = await client.patch(`/songs/like/${currentTrack?._id}`, null, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			dispatch(setUser(res.data));
			toast({
				description: "Your favorites have been updated",
				status: "success",
			});
		} catch {
			toast({
				description: "An error occurred",
				status: "error",
			});
		}
	};

	const handleLike = () => {
		if (!token) {
			dispatch(setModalMessage("Please login to save songs to your favorites."));
			onOpen();
		} else {
			likeSong();
		}
	};

	return (
		<>
			<LoginModal ref={modalRef} onClose={onClose} isOpen={isOpen} />
			<SimpleGrid
				templateColumns="repeat(3, 1fr)"
				align="center"
				justify="space-between"
				position="fixed"
				bottom="0"
				left="0"
				zIndex={100}
				width="full"
				p={4}
				border="1px"
				borderColor="zinc.600"
				roundedTop="lg"
				bgColor="blackAlpha.700"
				backdropFilter="blur(15px)"
			>
				<TrackDetails track={currentTrack} />
				<Flex direction="column" gap={2}>
					<PlayControls
						isPlaying={isPlaying}
						onNext={handleNextSong}
						onPlay={handlePlayPause}
						onPrevious={handlePreviousSong}
						repeatStatus={repeatStatus}
					/>
					<Hide below="md">
						<PlayingBar
							onSeek={seekPoint}
							time={songDetails?.time}
							track={currentTrack}
							trackRef={audioRef.current}
						/>
					</Hide>
				</Flex>
				<Flex align="center" justify="flex-end" gap={{ base: 0, md: 4 }}>
					<Button
						variant="unstyled"
						fontSize={{ base: 18, md: 24 }}
						p={0}
						h={{ base: 8, md: 12 }}
						minW={6}
						display="inline-flex"
						alignItems="center"
						justifyContent="center"
						color="accent.main"
						onClick={handleLike}
					>
						{user && user.favorites && user.favorites.includes(currentTrack?._id) ? (
							<AiFillHeart color="inherit" />
						) : (
							<AiOutlineHeart color="#ddd" />
						)}
					</Button>
					<Flex justifyContent="space-between" gap={0}>
						<Hide below="md">
							<VolumeControl
								onChange={changeVolume}
								onToggle={volumeToggle}
								volume={songDetails ? songDetails?.volume : 0}
							/>
						</Hide>
						<audio
							ref={audioRef}
							onPause={() => setAudioPlaying(false)}
							onPlay={() => setAudioPlaying(true)}
							onEnded={handleEnded}
							onTimeUpdate={() => {
								setSongDetails((prev) => ({
									...prev,
									time: Math.round(
										(audioRef.current.currentTime / audioRef.current.duration) * 100
									),
								}));
							}}
						/>
					</Flex>
				</Flex>
			</SimpleGrid>
		</>
	);
};

export { MusicPlayer };
