# ⏱️ DNS TTL Settings Guide

## 🎯 **What TTL to Use**

For both DNS records (A and CNAME), use:

### **Recommended:**
- **TTL: 3600** (1 hour) - This is the standard default

### **Or:**
- **TTL: Auto** (if Hostinger has this option)
- **TTL: Default** (if Hostinger has this option)
- **Leave empty** (if Hostinger auto-fills it)

---

## 📋 **For Your Records**

### **A Record:**
```
Type:     A
Name:     @
Value:    216.198.79.1
TTL:      3600  ← Use this
```

### **CNAME Record:**
```
Type:     CNAME
Name:     www
Value:    1a17048618b8cd0b.vercel-dns-017.com.
TTL:      3600  ← Use this
```

---

## 🔍 **What is TTL?**

**TTL (Time To Live)** = How long DNS servers cache your record

- **3600 seconds** = 1 hour
- **1800 seconds** = 30 minutes
- **86400 seconds** = 24 hours

---

## ✅ **Best Practice for Vercel**

**Use: 3600 seconds (1 hour)**

**Why?**
- ✅ Standard default value
- ✅ Good balance between speed and caching
- ✅ Works perfectly with Vercel
- ✅ Most DNS providers use this as default

---

## 📝 **In Hostinger**

When adding records:

1. **If there's a TTL field:**
   - Enter: `3600`
   - Or select from dropdown if available

2. **If TTL is auto-filled:**
   - Leave it as is (usually 3600)

3. **If there's no TTL field:**
   - Don't worry, Hostinger will use default (3600)

---

## ⚠️ **Don't Use These**

- ❌ **Very low TTL (300 or less):** Unnecessary, causes more DNS queries
- ❌ **Very high TTL (86400+):** Changes take too long to propagate

**Stick with 3600 - it's perfect!** ✅

---

## ✅ **Summary**

**For Both Records:**
- **TTL: 3600** (1 hour)

**That's it!** Simple and standard. 🎉






