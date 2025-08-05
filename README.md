# Michu - NoLeak Guardian

A one-time installable Git extension to protect your secrets by blocking `.env` file pushes globally.

## Installation

```bash
npm install -g michu
```

## Usage

After installation, simply run:

```bash
michu
```

This will install the pre-push hook globally. All new Git repositories you create will automatically have secret protection enabled.

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

- Staging `.env` files for commit
- Pushing repositories that already contain tracked `.env` files
- Any file matching the pattern `.env*` (including `.env.local`, `.env.production`, etc.)

## Example Output

When trying to push with a `.env` file:

```
🚨 WARNING: You're trying to push a staged .env file! Push blocked by NoLeak Guardian.
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