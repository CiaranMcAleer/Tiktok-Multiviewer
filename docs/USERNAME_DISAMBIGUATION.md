# Username Disambiguation System

The TikTok Multiviewer now has an improved system for handling usernames that could belong to multiple services.

### How it works:

#### 1. **Explicit URLs** (No ambiguity)
- `https://twitch.tv/ninja` → Twitch widget
- `https://www.youtube.com/@mkbhd` → YouTube widget  
- `https://www.tiktok.com/@charlidamelio` → TikTok widget

#### 2. **Service Prefixes** (Clear intent)
- `tw:ninja` or `twitch:ninja` → Twitch widget for "ninja"
- `yt:mkbhd` or `youtube:mkbhd` → YouTube widget for "mkbhd" 
- `@charlidamelio` → TikTok widget for "charlidamelio"

#### 3. **Ambiguous Usernames** (Interactive disambiguation)
When you enter just a username like `ninja`, the system will:
1. Detect it could be for multiple services
2. Show a confirmation dialog:
   - **OK**: Creates TikTok widget (default assumption)
   - **Cancel**: Shows help text with prefix options

#### 4. **Examples**

| Input | Result |
|-------|---------|
| `ninja` | Shows dialog → OK = TikTok @ninja, Cancel = shows prefix help |
| `tw:ninja` | Twitch channel "ninja" |
| `yt:mkbhd` | YouTube channel "mkbhd" |
| `@charlidamelio` | TikTok @charlidamelio |
| `https://twitch.tv/ninja` | Twitch channel "ninja" |

#### 5. **Benefits**
- ✅ No accidental wrong service selection
- ✅ Clear user intent with prefixes
- ✅ Fallback option for ambiguous cases
- ✅ Educational - teaches users the prefix system
- ✅ Works with existing URL patterns

This system eliminates the username collision problem while maintaining ease of use!

## Related Documentation

- **[Technical Documentation](./TECHNICAL.md)** - Architecture and implementation details
- **[Testing Guide](./TESTING.md)** - Testing setup and best practices  
- **[README](../README.md)** - Project overview and quick start guide

For technical implementation details about URL detection and processing, see the [Technical Documentation](./TECHNICAL.md).
