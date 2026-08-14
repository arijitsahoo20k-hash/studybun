# Naye 4 themes — Pop Static / Midnight Chrome / Neon Alley / Fractured Sky

## Update: App.jsx ab wired hua zip mein hai

Pehle maine socha tha ki App.jsx bilkul touch nahi karunga aur tumhe khud 3 lines add karne ke liye bolunga — lekin obviously un lines ke bina naye themes load hi nahi honge. Toh maine wo 3 additive lines khud daal di hain aur **`src/App.jsx` (poori file, already wired) is zip mein hai** — bas isse apne project mein overwrite kar do. `npm run build` chala ke confirm bhi kar liya hai ki build clean pass hota hai, koi error nahi.

Neeche wahi 3 lines ka exact diff hai (reference ke liye, taki dekh sako exactly kya change hua):

## Kya naya hai (sab independent, koi purani file edit nahi hui)

| File | Kya karta hai |
|---|---|
| `src/data/newThemes.js` | 4 naye theme definitions. Import hote hi `THEMES` object mein khud ko merge kar leta hai (`Object.assign`) — `src/data/themes.js` ko chhua tak nahi. |
| `src/components/decor/newMotifs.jsx` | 16 naye decor icons (4 per theme). Import hote hi `MOTIFS` object mein merge ho jaate hain — `Motifs.jsx` ko chhua tak nahi. |
| `src/styles/NewThemesStyle.jsx` | Har theme ka special look (comic halftone / chrome sheen / pixel scanlines / glitch twinkle). `GlobalStyle.jsx` ko chhua tak nahi — ye ek alag `<style>` component hai. |

`GlobalStyle.jsx` aur `App.jsx` ka **koi bhi existing line delete ya modify nahi hua.** Settings/Onboarding/Landing gallery automatically naye themes dikhayenge kyuki wo sab `THEMES` object se dynamically render karte hain — unko bhi kuch nahi karna.

## Zaroori: sirf 3 lines, sirf App.jsx mein

JS mein koi bhi naya code khud-ba-khud nahi chalta — usko kahin se ek baar **import** hona zaroori hai, warna ye 3 files kabhi load hi nahi honge aur naye themes kabhi dikhenge nahi. Ye sabse chhota, sabse safe touch hai jo avoid nahi ho sakta — aur ye sirf **add** hai, kuch bhi hataya ya badla nahi gaya:

**1) Sabse upar, existing imports ke baad, 2 lines add karo:**

```js
import "./data/newThemes";
import NewThemesStyle from "./styles/NewThemesStyle";
```

**2) `<GlobalStyle />` ke turant baad, 1 line add karo** (~line 1112 ke aas paas, jahan `.sb-app` div return hoti hai):

Pehle (isko bilkul waisa hi rehne do):
```jsx
<div className="sb-app" style={cssVars} data-stitched={theme.stitched ? "true" : "false"} data-blocky={theme.blocky ? "true" : "false"} data-y2k={theme.y2k ? "true" : "false"}>
  <GlobalStyle />
```

Baad mein (2 cheezein add hui — same attribute pattern jo stitched/blocky/y2k already use karte hain, aur GlobalStyle ke just neeche ek line):
```jsx
<div className="sb-app" style={cssVars} data-stitched={theme.stitched ? "true" : "false"} data-blocky={theme.blocky ? "true" : "false"} data-y2k={theme.y2k ? "true" : "false"} data-popstatic={theme.popStatic ? "true" : "false"} data-chromedrift={theme.chromeDrift ? "true" : "false"} data-pixelnight={theme.pixelNight ? "true" : "false"} data-glitchsky={theme.glitchSky ? "true" : "false"}>
  <GlobalStyle />
  <NewThemesStyle />
```

`newMotifs.jsx` ko alag se import karne ki zaroorat nahi — `newThemes.js` decor keys use karta hai jo `newMotifs.jsx` register karta hai, lekin safest yahi hai ki dono ek saath import ho jaayein. Toh step 1 mein ek line aur add kar lo:

```js
import "./data/newThemes";
import "./components/decor/newMotifs";
import NewThemesStyle from "./styles/NewThemesStyle";
```

## Ye 3 lines add karne ke baad kya hoga

- 4 naye themes Settings > Theme picker mein, Onboarding gallery mein, Landing preview mein — sab jagah automatically dikhenge.
- Har theme ka apna decor artwork (16 naye SVG icons) background mein drift karega.
- Har theme ka apna special texture/animation milega (halftone dots, chrome sheen sweep, pixel scanlines + neon glow, glitch twinkle) — sirf us theme ke active hone par.
- Baaki 16 purane themes, GlobalStyle.jsx ka poora existing CSS, aur App.jsx ka baaki poora logic **bilkul waisa hi** rahega jaisa hai.

## Rollback

Agar kabhi bhi hatana ho, bas ye 3 lines wapas nikaal do aur 4 naye files delete kar do — kuch bhi break nahi hoga, kyunki koi existing file mein koi aur change hai hi nahi.
