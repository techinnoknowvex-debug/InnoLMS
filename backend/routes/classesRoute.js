const express=require("express");
const supabase = require("../config/supabase");
const {CLASSES} = require("../models/tables");
const admincheck = require("../middleware/admincheck");
const ffmpeg = require('fluent-ffmpeg');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router=express.Router();

// Configure multer for file upload
const upload = multer({ storage: multer.memoryStorage() });

// Supabase Storage bucket name
const VIDEOS_BUCKET = 'course-videos';
const THUMBNAILS_BUCKET = 'course-thumbnails';


//for flexibility alredy the upload vidio route will the same work
router.post("/addClasses",admincheck,async (req, res) => {
    const { course_id, week_number, class_number, title, video_url, thumbnail_url, duration, course_batch} = req.body;

    try {
        if (!course_id || !week_number || !class_number || !title || !video_url || !course_batch) {
            return res.status(400).json({ message: "course_id, week_number, class_number, title, video_url, and course_batch are required" });
        }
        const { data: existingClass, error: checkError } = await supabase
            .from(CLASSES)
            .select("*")
            .eq("course_id", course_id)
            .eq("week_number", week_number)
            .eq("class_number", class_number)
            .eq("course_batch", course_batch)
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
                duration,
                course_batch
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
    const { course_batch } = req.query;

    try {
        let query = supabase
            .from(CLASSES)
            .select("*")
            .eq("course_id", course_id)
            .order("week_number", { ascending: true })
            .order("class_number", { ascending: true });

        if (course_batch) {
            query = query.eq("course_batch", course_batch);
        }

        const { data: classes, error: classesError } = await query;

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
    const { course_id, week_number, class_number, title, duration, course_batch } = req.body;
    const file = req.file;

    try {
        if (!file || !course_id || !week_number || !class_number || !title || !course_batch) {
            return res.status(400).json({ message: "File, course_id, week_number, class_number, title, and course_batch are required" });
        }

        // Check if class already exists
        const { data: existingClass } = await supabase
            .from(CLASSES)
            .select("*")
            .eq("course_id", course_id)
            .eq("week_number", week_number)
            .eq("class_number", class_number)
            .eq("course_batch", course_batch)
            .single();

        if (existingClass) {
            return res.status(409).json({ message: "Class already exists for this course, week, and class number" });
        }

        // 1️⃣ Upload video to Supabase Storage
        const videoFileName = `${course_id}/${week_number}/${class_number}/${Date.now()}-${file.originalname}`;
        const { data: videoData, error: videoUploadError } = await supabase.storage
            .from(VIDEOS_BUCKET)
            .upload(videoFileName, file.buffer, {
                contentType: file.mimetype,
                upsert: false
            });

        if (videoUploadError) {
            return res.status(500).json({ message: `Error uploading video: ${videoUploadError.message}` });
        }

        // Get public URL for video
        const { data: videoPublicData } = supabase.storage
            .from(VIDEOS_BUCKET)
            .getPublicUrl(videoFileName);
        const video_url = videoPublicData.publicUrl;

        // 2️⃣ Generate thumbnail using FFmpeg
        let thumbnail_url = null;
        try {
            const tmpFile = path.join(require('os').tmpdir(), `thumbnail-${Date.now()}.png`);
            
            await new Promise((resolve, reject) => {
                ffmpeg(file.buffer)
                    .on('error', reject)
                    .on('end', resolve)
                    .screenshots({
                        count: 1,
                        folder: path.dirname(tmpFile),
                        filename: path.basename(tmpFile),
                        size: '320x240'
                    });
            });

            // 3️⃣ Upload thumbnail to Supabase Storage
            const thumbnailFileName = `${course_id}/${week_number}/${class_number}/thumbnail-${Date.now()}.png`;
            const thumbnailBuffer = fs.readFileSync(tmpFile);
            
            const { data: thumbnailData, error: thumbnailUploadError } = await supabase.storage
                .from(THUMBNAILS_BUCKET)
                .upload(thumbnailFileName, thumbnailBuffer, {
                    contentType: 'image/png',
                    upsert: false
                });

            if (!thumbnailUploadError) {
                const { data: thumbnailPublicData } = supabase.storage
                    .from(THUMBNAILS_BUCKET)
                    .getPublicUrl(thumbnailFileName);
                thumbnail_url = thumbnailPublicData.publicUrl;
            }

            // Clean up temp file
            fs.unlinkSync(tmpFile);
        } catch (err) {
            console.log("Thumbnail generation skipped:", err.message);
            // Continue without thumbnail - it's optional
        }

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
                duration,
                course_batch
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