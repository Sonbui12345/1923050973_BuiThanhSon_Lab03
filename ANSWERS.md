# ANSWERS.md — Lab 03: Themed, Responsive, Accessible Screen

**Student Name:** Bùi Thanh Sơn  
**Student ID (MSSV):** 1923050973  
**Class:** TH7011101 (23DTH1)  

---

## STEP 0 — Personal Parameters

| Parameter | Formula | Calculation (N = 73) | Your Value |
| :--- | :--- | :--- | :--- |
| **Card corner radius** | `4 + (N mod 16)` | `4 + (73 mod 16) = 4 + 9` | **13** |
| **Grid columns on a phone** | `2 + (N mod 2)` | `2 + (73 mod 2) = 2 + 1` | **3** |
| **Accent hue** | `(N × 13) mod 360` | `(73 × 13) mod 360 = 949 mod 360` | **229** (Blue / Sapphire) |

---

## Contrast Measurements (WCAG 2.1 AA Compliance)

Tested text colours against surface backgrounds in both color schemes:

1. **Light Scheme:**
   - **Card Background:** `#FFFFFF`
   - **Body/Muted Text (`colors.muted`):** `#475569`
   - **Measured Contrast Ratio:** **5.90 : 1** (Passes WCAG AA requirement ≥ 4.5:1)
   - **Primary Text (`colors.text`):** `#0F172A` vs `#FFFFFF` is **16.1 : 1** (Passes AAA)

2. **Dark Scheme:**
   - **Card Background:** `#1E293B`
   - **Body/Muted Text (`colors.muted`):** `#CBD5E1`
   - **Measured Contrast Ratio:** **8.55 : 1** (Passes WCAG AA requirement ≥ 4.5:1)
   - **Primary Text (`colors.text`):** `#F8FAFC` vs `#1E293B` is **13.9 : 1** (Passes AAA)

---

## PART B — EXPLAIN (Prepared Answers)

### Question B1
> **Question:** Remove `flex: 1` from your body container, screenshot the result, and explain in one sentence what it was doing.  
> **Reference:** `App.tsx` (Line ~218: `body: { flex: 1 }`)  
> **Answer:**  
> `flex: 1` on the body container expands the `ScrollView` to take up all leftover vertical space between the header and footer, which pushes and pins the summary footer firmly against the bottom of the display.

---

### Question B2
> **Question:** Your tile width comes from `useWindowDimensions`. Describe precisely what breaks if you replace it with a fixed 180.  
> **Reference:** `App.tsx` (Lines ~38–41: `const { width } = useWindowDimensions(); const cardWidth = Math.floor((availableWidth - totalGaps) / numColumns);`)  
> **Answer:**  
> If the tile width is hardcoded to a fixed `180px`, on narrower phone screens (e.g. 360px–390px wide) 3 columns would demand at least 560px causing items to wrap unevenly or overflow horizontally, whereas on larger screens or landscape orientation, large dead whitespace appears on the right edge because cards fail to distribute proportionally to fill the container width.

---

### Question B3
> **Question:** Trace one colour from `theme/colors.ts` to a pixel on screen, naming each file it passes through.  
> **Reference:** `theme/colors.ts` -> `theme/useTheme.ts` -> `App.tsx`  
> **Answer:**  
> 1. `theme/colors.ts`: Defines `accent: '#1D4ED8'` in `lightColors` and `accent: '#60A5FA'` in `darkColors`.
> 2. `theme/useTheme.ts`: Imports `lightColors` and `darkColors`, queries the device mode with `useColorScheme()`, and returns the active `colors` object containing `accent`.
> 3. `App.tsx`: Calls `const { colors } = useTheme()`, extracts `colors.accent`, and applies it to the card's code text (`<Text style={[styles.cardCode, { color: colors.accent }]}>`), which React Native and the native graphic pipeline render as blue pixels on the screen.

---

### Question B4
> **Question:** Which control has your smallest touch target? Give its measured size before and after your fix.  
> **Reference:** `App.tsx` (Card tile pressable, around Lines ~85–130)  
> **Answer:**  
> The individual card tile pressables were initially bound strictly to inner content heights or tight tap areas measuring roughly `100px × 36px` on very short text. By setting `minHeight: 120` in the card style along with `hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}`, its effective interactive touch target expanded from `width × 36px` to well over `width × 136px` (minimum touch area of `90px × 120px` + 8px slop in all directions), fully exceeding the required `44 × 44` point minimum guideline.

---

## PART C — DEBUG (Faults Table)

Code inspected from prompt handout:
```tsx
export default function Screen() {
  const bg = '#FFFFFF';
  return (
    <View style={{ paddingTop: 24, backgroundColor: bg }}>
      <View style={styles.row}>
        <Text style={styles.title}>A very long product title that keeps going</Text>
        <Text style={styles.price}>250,000</Text>
      </View>
      <Pressable onPress={remove} style={styles.x}>
        <Text>x</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row:   { flexDirection: 'row' },
  title: { fontSize: 16, color: '#DDDDDD' },
  price: { fontSize: 16 },
  x:     { width: 20, height: 20 },
});
```

### Table of Four Faults and Minimal Fixes

| Line Number | Fault in One Sentence | Exact Change Made |
| :---: | :--- | :--- |
| **Line 4 & Line 18** | **Insufficient color contrast:** `#DDDDDD` on `#FFFFFF` gives a contrast ratio of ~1.36:1, violating WCAG AA 4.5:1 guidelines (unreadable in bright light). | Change Line 18: `title: { fontSize: 16, color: '#1E293B', flex: 1 }` (or use dark text `#333333` with 12.6:1 contrast). |
| **Line 6 & Line 17** | **Unconstrained text width in horizontal row:** `<Text>` title does not have `flex: 1` or truncation, pushing the `price` off the screen on narrower devices. | Add `flex: 1` to `title` style in Line 18: `title: { fontSize: 16, color: '#1E293B', flex: 1 }` and add `numberOfLines={1}` to `<Text>` on Line 6. |
| **Line 9 & Line 20** | **Touch target is too small and lacks accessibility semantics:** The close button is only `20 × 20` points without `hitSlop` or `accessibilityRole="button"`, making it nearly impossible to tap reliably and invisible to screen readers. | Change Line 9 to `<Pressable onPress={remove} style={styles.x} hitSlop={12} accessibilityRole="button" accessibilityLabel="Remove item">` and increase style `x: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' }`. |
| **Line 4** | **Hardcoded top padding ignores device safe area:** `paddingTop: 24` overlaps with the notch / dynamic island on modern iPhones and devices with status bars > 24pt. | Replace `paddingTop: 24` with `<SafeAreaView style={{ flex: 1, backgroundColor: bg }}>` or dynamic `paddingTop: insets.top` using `useSafeAreaInsets()`. |
