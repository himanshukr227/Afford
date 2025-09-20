
import React, { useState } from "react";
import { TextField, Button, Box, Alert, Typography, Grid } from "@mui/material";

const isValidUrl = url => {
  try {
    new URL(url); return true;
  } catch { return false; }
};

const DEFAULT_VALIDITY_MIN = 30 * 24 * 60;

export default function UrlShortenerPage({ onShorten }) {
  const [fields, setFields] = useState([
    { url: "", validity: "", shortcode: "", error: {} }
  ]);
  const [alert, setAlert] = useState("");

  const addInput = () => {
    if (fields.length < 5) setFields([...fields, { url: "", validity: "", shortcode: "", error: {} }]);
    else setAlert("Maximum 5 URLs at once.");
  };

  const removeInput = idx => {
    setFields(fields.filter((_, i) => i !== idx));
    setAlert("");
  };

  const handleChange = (idx, field, value) => {
    const newFields = fields.slice();
    newFields[idx][field] = value;
    newFields[idx].error = {};
    setFields(newFields);
    setAlert("");
  };

  const validateFields = () => {
    let allValid = true;
    const urls = new Set();
    const shortcodes = new Set();
    const newFields = fields.map((f, idx) => {
      let error = {};
      if (!f.url) { error.url = "URL required"; allValid = false; }
      else if (!isValidUrl(f.url)) { error.url = "Invalid URL"; allValid = false; }
      else if (urls.has(f.url)) { error.url = "Duplicate URL"; allValid = false; }
      else { urls.add(f.url); }
      if (f.validity) {
        if (!Number.isInteger(Number(f.validity)) || Number(f.validity) <= 0)
          { error.validity = "Enter positive number"; allValid = false; }
      }
      if (f.shortcode) {
        if (shortcodes.has(f.shortcode)) { error.shortcode = "Duplicate shortcode"; allValid = false; }
        shortcodes.add(f.shortcode);
      }
      return { ...f, error };
    });
    setFields(newFields);
    return allValid;
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!validateFields()) {
      setAlert("Please fix errors before submitting.");
      return;
    }
    setAlert("");
    const req = fields.map(f => ({
      url: f.url,
      validity: f.validity ? parseInt(f.validity, 10) : DEFAULT_VALIDITY_MIN,
      shortcode: f.shortcode || undefined
    }));
    onShorten && onShorten(req);
    setFields([{ url: "", validity: "", shortcode: "", error: {} }]);
  };

  return (
    <Box sx={{ maxWidth: 700, margin: "auto" }}>
      <Typography variant="h5" mb={2}>URL Shortener - Up to 5 URLs</Typography>
      {alert && <Alert severity="error" sx={{ mb:2 }}>{alert}</Alert>}
      <form onSubmit={handleSubmit} noValidate>
        {fields.map((f, i) => (
          <Grid container spacing={2} alignItems="center" key={i} sx={{mb:1}}>
            <Grid item xs={4}>
              <TextField
                required
                label="Long URL"
                value={f.url}
                onChange={e => handleChange(i, "url", e.target.value)}
                error={Boolean(f.error.url)}
                helperText={f.error.url || ""}
                fullWidth
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                label="Validity (min, optional)"
                value={f.validity}
                onChange={e => handleChange(i, "validity", e.target.value.replace(/\D+/g,""))}
                error={Boolean(f.error.validity)}
                helperText={f.error.validity || ""}
                inputProps={{ maxLength: 6 }}
                fullWidth
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                label="Preferred shortcode (optional)"
                value={f.shortcode}
                onChange={e => handleChange(i, "shortcode", e.target.value.trim())}
                error={Boolean(f.error.shortcode)}
                helperText={f.error.shortcode || ""}
                inputProps={{ maxLength: 10, pattern: "[A-Za-z0-9_-]+" }}
                fullWidth
              />
            </Grid>
            <Grid item xs={2}>
              {fields.length > 1 && (
                <Button color="error" variant="outlined" onClick={() => removeInput(i)}>Remove</Button>
              )}
            </Grid>
          </Grid>
        ))}
        <Box sx={{ display: "flex", gap: 2, mb:2 }}>
          <Button variant="contained" onClick={addInput} disabled={fields.length >= 5}>
            + Add URL
          </Button>
          <Button variant="contained" color="primary" type="submit">
            Shorten URLs
          </Button>
        </Box>
      </form>
    </Box>
  );
}
