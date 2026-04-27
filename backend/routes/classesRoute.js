const express=require("express");
const supabase = require("../config/supabase");
const {CLASSES} = require("../models/tables");
const admincheck = require("../middleware/admincheck");
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const ffmpeg = require('fluent-ffmpeg');
const { Readable } = require('stream');
const multer = require('multer');

const router=express.Router();

// Configure S3 client
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

// Configure multer for file upload
const upload = multer({ storage: multer.memoryStorage() });


//for flexibility alredy the upload vidio route will the same work
router.post("/addClasses",admincheck,async (req, res) => {
    const { course_id, week_number, class_number, title, video_url, thumbnail_url, duration} = req.body;

    try {
        if (!course_id || !week_number || !class_number || !title || !video_url) {
            return res.status(400).json({ message: "course_id, week_number, class_number, title, and video_url are required" });
        }
        const { data: existingClass, error: checkError } = await supabase
            .from(CLASSES)
            .select("*")
            .eq("course_id", course_id)
            .eq("week_number", week_number)
            .eq("class_number", class_number)
            .single();

        if (existingClass) {
            return res.status(409).json({ message: "Class already exists for this course, week, and class number" });
        }

        const { error: insertError } = await supabase
            .from(CLASSES)
            .insert([{
                course_id,
                week_number,
                class_number,
                title,
                video_url,
                thumbnail_url,
                duration
            }]);

        if (insertError) {
            return res.status(500).json({ message: `Error inserting class: ${insertError.message}` });
        }

        return res.status(200).json({ message: `Class "${title}" added successfully` });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

router.get("/classes/:course_id/:week_number", async (req, res) => {
    const { course_id, week_number } = req.params;

    try {
        const { data: classes, error: classesError } = await supabase
            .from(CLASSES)
            .select("*")
            .eq("course_id", course_id)
            .eq("week_number", week_number)
            .order("class_number", { ascending: true });

        if (classesError) {
            return res.status(500).json({ message: `Error fetching classes: ${classesError.message}` });
        }

        return res.status(200).json({ message: "Classes fetched successfully", classes });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

router.get("/classes/:course_id", async (req, res) => {
    const { course_id } = req.params;

    try {
        const { data: classes, error: classesError } = await supabase
            .from(CLASSES)
            .select("*")
            .eq("course_id", course_id)
            .order("week_number", { ascending: true })
            .order("class_number", { ascending: true });

        if (classesError) {
            return res.status(500).json({ message: `Error fetching classes: ${classesError.message}` });
        }

        return res.status(200).json({ message: "Classes fetched successfully", classes });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});


// Upload video and generate thumbnail
router.post("/uploadVideo", admincheck, upload.single('video'), async (req, res) => {
    const { course_id, week_number, class_number, title, duration } = req.body;
    const file = req.file;

    try {
        if (!file || !course_id || !week_number || !class_number || !title) {
            return res.status(400).json({ message: "File, course_id, week_number, class_number, and title are required" });
        }

        // Check if class already exists
        const { data: existingClass } = await supabase
            .from(CLASSES)
            .select("*")
            .eq("course_id", course_id)
            .eq("week_number", week_number)
            .eq("class_number", class_number)
            .single();

        if (existingClass) {
            return res.status(409).json({ message: "Class already exists for this course, week, and class number" });
        }

        const bucket = process.env.S3_BUCKET_NAME;

        // 1️⃣ Upload video to S3
        const videoKey = `videos/${course_id}/${week_number}/${class_number}/${file.originalname}`;
        await s3.send(new PutObjectCommand({
            Bucket: bucket,
            Key: videoKey,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: 'public-read'
        }));
        const video_url = `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${videoKey}`;

        // 2️⃣ Generate thumbnail using FFmpeg
        // Note: FFmpeg screenshots saves to /tmp by default, we read it back
        const thumbnailBuffer = await new Promise((resolve, reject) => {
            const tmpFile = `/tmp/thumbnail-${Date.now()}.png`;
            ffmpeg(file.buffer)
                .on('error', reject)
                .on('end', () => {
                    const fs = require('fs');
                    const buffer = fs.readFileSync(tmpFile);
                    resolve(buffer);
                    fs.unlinkSync(tmpFile); // clean up
                })
                .screenshots({
                    count: 1,
                    folder: '/tmp',
                    filename: `thumbnail-${Date.now()}.png`,
                    size: '320x240'
                });
        });

        // 3️⃣ Upload thumbnail to S3
        const thumbnailKey = `thumbnails/${course_id}/${week_number}/${class_number}/thumbnail-${Date.now()}.png`;
        await s3.send(new PutObjectCommand({
            Bucket: bucket,
            Key: thumbnailKey,
            Body: thumbnailBuffer,
            ContentType: 'image/png',
            ACL: 'public-read'
        }));
        const thumbnail_url = `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${thumbnailKey}`;

        // 4️⃣ Insert into Supabase
        const { error: insertError } = await supabase
            .from(CLASSES)
            .insert([{
                course_id,
                week_number,
                class_number,
                title,
                video_url,
                thumbnail_url,
                duration
            }]);

        if (insertError) {
            return res.status(500).json({ message: `Error inserting class: ${insertError.message}` });
        }

        return res.status(200).json({
            message: `Video uploaded and class "${title}" added successfully`,
            video_url,
            thumbnail_url
        });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

module.exports = router;