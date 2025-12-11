import { ref, watch, onMounted, computed } from "vue";

export function usePalette() {
    const colorCount = ref(5);
    const colorFormat = ref("hex");
    const isDarkTheme = ref(false);
    const currentColors = ref([]);
    const pinnedColors = ref([]);
    const savedPalettes = ref([]);
    const showNotification = ref(false);
    const baseColorHex = ref('#ffffff');


    const baseColor = computed(() => hexToHsl(baseColorHex.value));


    const applyTheme = () => {
        if (isDarkTheme.value) {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
    };




    const generateRandomHSL = () => {
        const baseHue = Math.floor(Math.random() * 360);
        const hueVariation = 30;

        const hue = (baseHue + Math.floor(Math.random() * hueVariation)) % 360;
        const saturation = 40 + Math.floor(Math.random() * 40);
        const lightness = 30 + Math.floor(Math.random() * 40);

        return { h: hue, s: saturation, l: lightness };
    };

    const hslToHex = (h, s, l) => {
        s /= 100;
        l /= 100;
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = l - c / 2;

        let r, g, b;

        if (h < 60) { r = c; g = x; b = 0; }
        else if (h < 120) { r = x; g = c; b = 0; }
        else if (h < 180) { r = 0; g = c; b = x; }
        else if (h < 240) { r = 0; g = x; b = c; }
        else if (h < 300) { r = x; g = 0; b = c; }
        else { r = c; g = 0; b = x; }

        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);

        return (
            "#" +
            r.toString(16).padStart(2, "0") +
            g.toString(16).padStart(2, "0") +
            b.toString(16).padStart(2, "0")
        );
    };

    const hslToRgb = (h, s, l) => {
        s /= 100;
        l /= 100;
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = l - c / 2;

        let r, g, b;
        if (h < 60) { r = c; g = x; b = 0; }
        else if (h < 120) { r = x; g = c; b = 0; }
        else if (h < 180) { r = 0; g = c; b = x; }
        else if (h < 240) { r = 0; g = x; b = c; }
        else if (h < 300) { r = x; g = 0; b = c; }
        else { r = c; g = 0; b = x; }

        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);

        return `rgb(${r}, ${g}, ${b})`;
    };


    const hexToHsl = (hex) => {
        hex = hex.replace(/^#/, '');

        if (hex.length === 3) {
            hex = hex.split('').map(char => char + char).join('');
        }

        const r = parseInt(hex.substring(0, 2), 16) / 255;
        const g = parseInt(hex.substring(2, 4), 16) / 255;
        const b = parseInt(hex.substring(4, 6), 16) / 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);

        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }

            h /= 6;
        }

        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    };


    const generatePalette = () => {
        const colors = [];
        const base = generateRandomHSL();

        for (let i = 0; i < colorCount.value; i++) {
            const hue = (base.h + i * 30) % 360;
            const saturation = Math.max(30, Math.min(80, base.s + (i % 3) * 10));
            const lightness = Math.max(20, Math.min(80, base.l + (i % 2) * 15));

            colors.push({
                hex: hslToHex(hue, saturation, lightness),
                rgb: hslToRgb(hue, saturation, lightness),
                hsl: { h: hue, s: saturation, l: lightness }
            });
        }
        currentColors.value = colors;
    };

    const generatePaletteOnBaseColor = () => {
        const colors = [];
        const base = baseColor.value;

        for (let i = 0; i < colorCount.value; i++) {
            const hue = (base.h + i * 30) % 360;
            const saturation = Math.max(30, Math.min(80, base.s + (i % 3) * 10));
            const lightness = Math.max(20, Math.min(80, base.l + (i % 2) * 15));

            colors.push({
                hex: hslToHex(hue, saturation, lightness),
                rgb: hslToRgb(hue, saturation, lightness),
                hsl: { h: hue, s: saturation, l: lightness }
            });
        }
        currentColors.value = colors;
    };


    const copyToClipboard = async (color) => {
        const text = colorFormat.value === "hex" ? color.hex : color.rgb;
        await navigator.clipboard.writeText(text);

        showNotification.value = true;
        setTimeout(() => (showNotification.value = false), 2000);
    };

    const pinColor = (color) => {
        if (!pinnedColors.value.some((c) => c.hex === color.hex)) {
            pinnedColors.value.push({ ...color });
        }
    };

    const unpinColor = (i) => pinnedColors.value.splice(i, 1);

    const savePalette = () => {
        if (currentColors.value.length === 0) return;
        savedPalettes.value.unshift({
            colors: [...currentColors.value],
            date: new Date()
        });
        persist();
    };

    const deletePalette = (i) => {
        savedPalettes.value.splice(i, 1);
        persist();
    };

    const persist = () => {
        localStorage.setItem(
            "colorPalettes",
            JSON.stringify({
                savedPalettes: savedPalettes.value,
                pinnedColors: pinnedColors.value,
                colorFormat: colorFormat.value,
                isDarkTheme: isDarkTheme.value,
                baseColorHex: baseColorHex.value
            })
        );
    };

    const load = () => {
        const saved = localStorage.getItem("colorPalettes");
        if (!saved) return;

        const data = JSON.parse(saved);
        savedPalettes.value = data.savedPalettes || [];
        pinnedColors.value = data.pinnedColors || [];
        colorFormat.value = data.colorFormat || "hex";
        isDarkTheme.value = data.isDarkTheme || false;
        baseColorHex.value = data.baseColorHex || '#8b7a3a';

        applyTheme();
    };

    onMounted(() => {
        load();
        if (!currentColors.value.length) generatePalette();
    });

    watch(isDarkTheme, () => {
        applyTheme();
        persist();
    }, { immediate: false });

    watch([savedPalettes, pinnedColors, colorFormat, baseColorHex], persist, {
        deep: true
    });

    return {
        colorCount,
        colorFormat,
        isDarkTheme,
        currentColors,
        pinnedColors,
        savedPalettes,
        showNotification,
        generatePalette,
        copyToClipboard,
        pinColor,
        unpinColor,
        savePalette,
        deletePalette,
        generatePaletteOnBaseColor,
        baseColorHex
    };
}
