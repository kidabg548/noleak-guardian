# Michu - NoLeak Guardian

A one-time installable Git extension to protect your secrets by blocking `.env` file pushes globally.

## Installation

```bash
npm install -g michu
```

## Usage

### Quick Start
```bash
# Install globally
npm install -g michu

# Set up the pre-push hook
michu install
```

### Commands
```bash
michu install     # Install the global pre-push hook (default)
michu uninstall   # Remove the global pre-push hook
michu config      # Show current configuration
michu test        # Test secret detection on current repository
michu status      # Check installation status
michu help        # Show help message
```

### Configuration
The tool creates a config file at `~/.michu-config.json` where you can customize:
- Secret file patterns
- Safe file patterns (ignored)
- Content patterns to check for
- Behavior settings

```bash
# View current config
michu config

# Edit config manually
nano ~/.michu-config.json
```

## How it works

1. **Global Installation**: When you run `michu`, it installs a pre-push hook template globally
2. **Automatic Protection**: Every new Git repository you create will automatically inherit this protection
3. **Dynamic Path Resolution**: The hook dynamically finds the `checkSecrets.js` script regardless of where the package is installed
4. **Secret Detection**: Before each push, it checks for any `.env` files in your staged or tracked files
5. **Push Blocking**: If `.env` files are detected, the push is blocked with a clear warning message

## Features

- ✅ **Global Installation**: One-time setup works for all future repositories
- ✅ **Cross-Platform**: Works on Windows, macOS, and Linux
- ✅ **Dynamic Path Resolution**: Automatically finds the script regardless of installation location
- ✅ **Clear Error Messages**: Provides helpful feedback when secrets are detected
- ✅ **Zero Configuration**: Works out of the box after installation
- ✅ **Git Installation Check**: Verifies Git is available before installation
- ✅ **Existing Hook Backup**: Safely backs up existing pre-push hooks
- ✅ **Debug Mode**: Run `DEBUG=true git push` for troubleshooting
- ✅ **Robust Path Resolution**: Uses reliable npm methods to find the package

## What it protects against

### File Types
- `.env*` files (`.env`, `.env.local`, `.env.production`, etc.)
- `.envrc` (direnv files)
- `.secrets*` files
- `secrets.*` files (JSON, YAML, TOML)
- `config.*` files that might contain secrets
- SSL/TLS private keys (`.pem`, `.key`, `.p12`, `.pfx`)
- SSH private keys (`id_rsa`)
- AWS credentials (`.aws/credentials`)
- Docker and Git ignore files

### Content Patterns
- Passwords, secrets, API keys
- Database connection strings
- AWS access keys
- Private keys and tokens
- Any variable containing sensitive data

### Safe Files (Automatically Ignored)
- `.env.example`, `.env.template`, `.env.sample`
- `config.example.*`, `secrets.example.*`
- Template and sample files

## Example Output

When trying to push with a `.env` file:

```
🚨 WARNING: You're trying to push a staged .env file! Push blocked by Michu.
🔍 Found in staged files:
- .env
```

## Troubleshooting

### Debug Mode
If you encounter issues, run the hook in debug mode:

```bash
DEBUG=true git push
```

This will show you exactly which paths the hook is trying to use to find the `checkSecrets.js` script.

### Manual Installation for Existing Repositories
If you have existing repositories that don't have the hook, you can manually copy it:

```bash
cp ~/.git-templates/hooks/pre-push .git/hooks/pre-push
chmod +x .git/hooks/pre-push
```

## Uninstall

To remove the global hook:

```bash
git config --global --unset init.templateDir
rm -rf ~/.git-templates
```

## License

MIT 