import { useState } from "react";
import { BiCloudUpload } from "react-icons/bi";
import { client } from "../api/index";
import {
    Box,
    Text,
    Button,
    Input,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    FormControl,
    FormLabel,
    Flex,
} from "@chakra-ui/react";

const AddNewSongs = () => {
    const [selectedMusic, setSelectedMusic] = useState(null);
    const [coverImage, setCoverImage] = useState("");
    const [title, setTitle] = useState("");
    const [artistName, setArtistName] = useState("");
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [fileName, setFileName] = useState("");

    function handleMusicChange(ev) {
        setSelectedMusic(ev.target.files[0]);
        setFileName(ev.target.files[0].name);
    }

    function handleImageLinkChange(ev) {
        setCoverImage(ev.target.value);
    }

    const uploadMusic = async () => {
        setIsLoading(true);
        const formData = new FormData();
        formData.append("file", selectedMusic);
        formData.append("title", title);
        formData.append("artistes", artistName);
        formData.append("coverImage", coverImage);

        try {
            const response = await client.post("/songs/uploadSongs", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setUploadSuccess(true);
            console.log("File uploaded successfully:", response.data);
        } catch (error) {
            console.error("Error uploading file:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const onClose = () => setUploadSuccess(false);

    return (
        <Box p={8} maxW="500px" mx="auto" mt={20} bg="black" borderRadius="md">
            <Text fontSize="2xl" fontWeight="bold" mb={6} textAlign="center">
                Upload New Song
            </Text>
            <FormControl mb={4}>
                <Flex align="center" >
                    <Input
                        type="file"
                        id="file"
                        h={200} w={400}
                        onChange={handleMusicChange}
                        display="none"

                    />
                    <label htmlFor="file">
                        <Button

                            as="span"
                            colorScheme="blue"
                            variant="outline"
                            borderRadius="md"
                            p={2}
                        >
                            <BiCloudUpload style={{ fontSize: "4rem" }} />
                        </Button>
                    </label>
                </Flex><br />
                <span style={{ overflow: 'hidden', }}>
                    {fileName}
                </span>

            </FormControl>

            <FormControl mb={4}>
                <FormLabel htmlFor="title">Title</FormLabel>
                <Input
                    id="title"
                    placeholder="Enter title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </FormControl>
            <FormControl mb={4}>
                <FormLabel htmlFor="artistName">Artist Name</FormLabel>
                <Input
                    id="artistName"
                    placeholder="Enter artist name"
                    value={artistName}
                    onChange={(e) => setArtistName(e.target.value)}
                />
            </FormControl>
            <FormControl mb={4}>
                <FormLabel htmlFor="coverImage">Cover Image Link</FormLabel>
                <Input
                    id="coverImage"
                    placeholder="Paste cover image link"
                    value={coverImage}
                    onChange={handleImageLinkChange}
                />
            </FormControl>
            <Button
                isLoading={isLoading}
                loadingText="Uploading..."
                bg="accent.main"
                size="lg"
                leftIcon={<BiCloudUpload />}
                onClick={uploadMusic}
                mb={4}
                width="100%"
            >
                Upload Music
            </Button>
            <Modal isOpen={uploadSuccess} onClose={onClose}>
                <ModalOverlay />
                <ModalContent bg="accent.main" color="white">
                    <ModalHeader textAlign="center">Upload Success!</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        Your music has been uploaded successfully.
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default AddNewSongs;
