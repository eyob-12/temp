import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import multer from 'multer';
import mm from 'music-metadata';
import path from 'path';
import fs from 'fs';
import Song from './models/Song.js';
import { connectDb } from './config/dbConnection.js';
import { songsRouter } from './routes/songRoutes.js';
import { userRouter } from './routes/userRoutes.js';
import { artisteRouter } from './routes/artisteRoutes.js';
import { playlistRouter } from './routes/playlistRoutes.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

connectDb();

app.use('/api/songs', songsRouter);
app.use('/api/users', userRouter);
app.use('/api/artistes', artisteRouter);
app.use('/api/playlists', playlistRouter);

const UPLOADS_DIR = path.join(path.resolve(), 'uploads');

// Middleware to serve static files (uploaded music)
app.use('/uploads', express.static(UPLOADS_DIR));

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, UPLOADS_DIR); // Directory where uploaded files will be stored
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + path.extname(file.originalname)); // Generate unique filename
	}
});

const upload = multer({ storage: storage });

// Function to format duration in milliseconds to "minutes:seconds" format
const formatDuration = (durationMs) => {
	const minutes = Math.floor(durationMs / 60000);
	const seconds = ((durationMs % 60000) / 1000).toFixed(0);
	return `${minutes}:${(seconds < 10 ? '0' : '')}${seconds}`;
};

// Route for uploading music
app.post('/api/songs/uploadSongs', upload.single('file'), async (req, res) => {
	try {
		const { originalname, size } = req.file;
		const { title, coverImage, artistes } = req.body;

		const metadata = await mm.parseFile(req.file.path);
		// Format duration into "minutes:seconds" format
		const duration = formatDuration(metadata.format.duration * 1000); // Extract duration from metadata

		const newSong = new Song({
			title: title || originalname,
			coverImage: coverImage || "https://image.pngaaa.com/851/2152851-middle.png",
			filename: req.file.filename,
			artistes: artistes || [],
			duration: duration,
			size: size,
		});

		await newSong.save();
		res.status(200).json({ message: 'File uploaded successfully', data: newSong });
	} catch (error) {
		console.error('Error uploading file:', error);
		res.status(500).json({ error: 'Failed to upload file' });
	}
});

// Route to serve music files
app.get('/api/songs/:filename', (req, res) => {
	try {
		const filename = req.params.filename;
		const filePath = path.join(UPLOADS_DIR, filename);

		if (fs.existsSync(filePath)) {
			res.sendFile(filePath);
		} else {
			res.status(404).json({ error: 'File not found' });
		}
	} catch (error) {
		console.error('Error serving file:', error);
		res.status(500).json({ error: 'Something went wrong!' });
	}
});



const port = 4000;

app.listen(port, () => {
	console.log(`SERVER RUNNING ON PORT ${port}`);
});
