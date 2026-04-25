const express = require("express");
const supabase = require("../config/supabase");
const { DEVICES, STUDENTS } = require("../models/tables");
const router = express.Router();

const MAX_DEVICES = 2;

// Add/Register device
router.post("/registerDevice", async (req, res) => {
  const { student_id, device_id, device_name } = req.body;

  try {
    if (!student_id || !device_id) {
      return res.status(400).json({ message: "Student ID and Device ID are required" });
    }

    // Check if device already exists
    const { data: existingDevice } = await supabase
      .from(DEVICES)
      .select("id")
      .eq("student_id", student_id)
      .eq("device_id", device_id)
      .maybeSingle();

    if (existingDevice) {
      // Update last_accessed
      await supabase
        .from(DEVICES)
        .update({ last_accessed: new Date().toISOString(), is_active: true })
        .eq("id", existingDevice.id);

      return res.status(200).json({
        message: "Device already registered",
        device_id: existingDevice.id,
        is_new: false,
      });
    }

    // Get count of active devices for this student
    const { data: devices, error: countError } = await supabase
      .from(DEVICES)
      .select("id, created_at")
      .eq("student_id", student_id)
      .eq("is_active", true);

    if (countError) {
      return res.status(400).json({ message: countError.message });
    }

    // If max devices reached, inform user to remove old device
    if (devices && devices.length >= MAX_DEVICES) {
      return res.status(429).json({
        message: "Maximum devices reached",
        max_devices: MAX_DEVICES,
        active_devices: devices.length,
        devices: devices.map((d) => ({
          id: d.id,
          created_at: d.created_at,
        })),
        action_required: "remove_device",
      });
    }

    // Register new device
    const { data: newDevice, error: insertError } = await supabase
      .from(DEVICES)
      .insert([
        {
          student_id,
          device_id,
          device_name: device_name || "Mobile Device",
          created_at: new Date().toISOString(),
          last_accessed: new Date().toISOString(),
          is_active: true,
        },
      ])
      .select();

    if (insertError) {
      return res.status(400).json({ message: insertError.message });
    }

    return res.status(201).json({
      message: "Device registered successfully",
      device: newDevice[0],
      is_new: true,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Get all devices for a student
router.get("/devices/:student_id", async (req, res) => {
  const { student_id } = req.params;

  try {
    const { data: devices, error } = await supabase
      .from(DEVICES)
      .select("*")
      .eq("student_id", student_id)
      .order("last_accessed", { ascending: false });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(200).json({
      devices,
      total: devices ? devices.length : 0,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Remove/Deactivate device
router.delete("/devices/:device_id", async (req, res) => {
  const { device_id } = req.params;

  try {
    const { data, error } = await supabase
      .from(DEVICES)
      .update({ is_active: false })
      .eq("id", device_id)
      .select();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "Device not found" });
    }

    return res.status(200).json({
      message: "Device removed successfully",
      device: data[0],
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
