# Auto-Update Not Working - Fix Guide

## 🔍 Common Reasons Why Auto-Update Fails

### 1. Missing `latest.yml` File in GitHub Release ⚠️ MOST COMMON
**Problem:** The `latest.yml` file wasn't uploaded to GitHub release
**Solution:** Upload it manually

### 2. Client Has Same Version
**Problem:** Client device already has v1.0.2 installed
**Solution:** Can't update to same version - need v1.0.3

### 3. GitHub Release Not Published
**Problem:** Release is in "Draft" mode
**Solution:** Make sure release is published

---

## ✅ Step-by-Step Fix

### Step 1: Check Your GitHub Release
Go to: https://github.com/Soumyadip-03/check-printing-system/releases/tag/v1.0.2

**You should see TWO files:**
- ✅ `Check Printing System Setup 1.0.2.exe`
- ✅ `latest.yml`

**If `latest.yml` is missing:**

1. Go to your project folder: `dist/`
2. Find `latest.yml` file
3. Edit your GitHub release
4. Upload `latest.yml`
5. Save release

---

### Step 2: Install Dependencies
```bash
npm install
```
This installs the new `electron-log` package for better debugging.

---

### Step 3: Verify Client Version
On the client device:
1. Open the app
2. Go to Help → About
3. Check version number

**If it shows v1.0.2:**
- You can't update to v1.0.2 again
- Need to create v1.0.3 to test

**If it shows v1.0.1:**
- Should work after uploading `latest.yml`

---

### Step 4: Test with Logging (New Version)

Since we added logging, let's create v1.0.3 to test:

1. **Update version in package.json:**
   ```json
   "version": "1.0.3"
   ```

2. **Commit and push:**
   ```bash
   git add .
   git commit -m "fix: add auto-update logging for v1.0.3"
   git push origin main
   ```

3. **Build:**
   ```bash
   npm run dist
   ```

4. **Create GitHub Release v1.0.3:**
   - Tag: `v1.0.3`
   - Upload BOTH files from `dist/`:
     - `Check Printing System Setup 1.0.3.exe`
     - `latest.yml`

5. **Test on client (with v1.0.2):**
   - Open app
   - Check DevTools (View → Toggle DevTools)
   - Look for console messages:
     - "Checking for updates..."
     - "Update available: ..."
     - Or error messages

---

## 🔧 What We Fixed

### Added Better Logging
Now the app will show:
- ✅ When it's checking for updates
- ✅ If update is available (with version number)
- ✅ If no update is available
- ✅ Any errors that occur
- ✅ Download progress
- ✅ When update is downloaded

### Error Dialog
If there's an error, you'll see a popup with the error message.

---

## 📋 Checklist for Auto-Update to Work

- [ ] GitHub release is published (not draft)
- [ ] Release has BOTH `.exe` and `latest.yml` files
- [ ] Release tag matches version in package.json (e.g., v1.0.3)
- [ ] Client has older version installed (e.g., v1.0.2)
- [ ] Client device has internet connection
- [ ] Repository is public OR client has access

---

## 🎯 Quick Test

### Option A: Check if `latest.yml` exists
1. Go to: https://github.com/Soumyadip-03/check-printing-system/releases/tag/v1.0.2
2. Look for `latest.yml` file
3. If missing, upload it from your `dist/` folder

### Option B: Create v1.0.3 with logging
Follow Step 4 above to create a new version with better error reporting.

---

## 📝 What `latest.yml` Contains

Example content:
```yaml
version: 1.0.2
files:
  - url: Check Printing System Setup 1.0.2.exe
    sha512: [hash]
    size: [bytes]
path: Check Printing System Setup 1.0.2.exe
sha512: [hash]
releaseDate: '2024-01-15T10:30:00.000Z'
```

This file tells electron-updater:
- What version is available
- Where to download it
- File integrity check

**Without this file, auto-update CANNOT work!**

---

## 🚨 Most Likely Issue

Based on your setup, the most likely issue is:

**Missing `latest.yml` in GitHub Release**

**Quick Fix:**
1. Check your `dist/` folder for `latest.yml`
2. Go to GitHub release v1.0.2
3. Click "Edit"
4. Upload `latest.yml`
5. Save

Then test on client device - should work immediately!
