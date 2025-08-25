## DocumentEditor (React Native)

An opinionated rich-text viewing and formatting experience powered by `react-native-webview` with a native toolbar. The WebView is selection-only (not free-typing) while the toolbar applies formatting (font family, size, color, bold/italic/underline) to the selected text.

### Features
- Selection-only WebView: users can select text but cannot type or navigate links
- Formatting Toolbar: font, size, color, bold, italic, underline
- Color Picker: full-screen, scrollable palette with immediate apply
- Selection Preservation: formatting applies even if the selection momentarily collapses
- Cross-platform: iOS and Android

### Project Structure (high level)
- `src/components/DocumentEditor/index.tsx`: main editor container (header, toolbar, WebView, footer)
- `src/components/DocumentEditor/components/DocumentWebView.tsx`: WebView wrapper with injected HTML/JS
- `src/components/DocumentEditor/components/FormattingToolbar.tsx`: toolbar layout
- `src/components/DocumentEditor/components/StyleControls.tsx`: bold/italic/underline controls
- `src/components/DocumentEditor/components/DropdownMenu.tsx`: dropdown used for font and size
- `src/components/DocumentEditor/components/ColorControls.tsx`: color chip and modal palette
- `src/components/DocumentEditor/components/SelectedTextDisplay.tsx`: shows currently selected text
- `src/components/DocumentEditor/components/DocumentHeader.tsx`: header (back optional, privacy button optional)

### Getting Started

Prerequisites:
- Node.js 16+
- Yarn or npm
- Xcode (for iOS) and/or Android Studio (for Android)

Install dependencies:
```bash
yarn install
# or
npm install
```

iOS setup:
```bash
cd ios
pod install
cd ..
yarn ios
```

Android setup:
```bash
yarn android
```

### Usage

Render the `DocumentEditor` somewhere in your app (see `App.tsx` for example wiring). Toolbar actions are already connected to the WebView via `executeCommand` and injected JS.

### How Formatting Works
- The WebView injects HTML with a content area (`#editor`) that is `contenteditable` toggled only while applying commands.
- Selection is tracked in `lastRange` and `stableRange` within the WebView.
- Before applying a command, the WebView restores the last stable range to ensure the previously selected text is still targeted.
- Commands include:
  - `fontName` (with fallback to wrapping span style)
  - `fontSize`
  - `foreColor`
  - `bold` / `italic` / `underline`

### Color Picker
- Open from the toolbar chip to see a scrollable palette
- Tapping a color applies immediately and closes the modal shortly after to avoid selection loss

### Bundling Custom Fonts (Optional but Recommended)
Using only system fonts can result in inconsistent availability across platforms. To guarantee font families:
1. Add `.ttf`/`.otf` to:
   - Android: `android/app/src/main/assets/fonts/YourFont.ttf`
   - iOS: add the font files to your Xcode project and `Info.plist` under `UIAppFonts`
2. Reference via `@font-face` in the injected HTML or use family names recognized by the platform.
3. Apply via toolbar (uses `execCommand('fontName')` with fallback to span style).

### Troubleshooting
- Dropdown menu clipped/hidden: we render in a modal to avoid parent clipping; ensure no custom parent `overflow: 'hidden'` container wraps the modal content.
- Selection disappears before formatting applies: handled by `stableRange` restoration; if issues persist, ensure `onColorChange` or other handlers do not blur the WebView.
- Fonts not changing: bundle the font and use `@font-face`, or choose fonts known to exist on the running platform.
- iOS caret visible: we set `caret-color: transparent` and toggle `contenteditable` only during the command.

### Scripts
```json
{
  "start": "react-native start",
  "ios": "react-native run-ios",
  "android": "react-native run-android",
  "test": "jest"
}
```

### License
MIT

This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
# DocumentEditor
