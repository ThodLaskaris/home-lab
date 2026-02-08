<script>
    export const type = 'button';
    export const disabled = true;
    export const color = 'primary';
</script>

<button 
    type={type}
    disabled={disabled}
    class='{color} active:scale-95 transition-transform text-white font-bold py-4 px-6 rounded-xl shadow-lg w-full text-xl uppercase tracking-wide'
    >
    <slot/>
</button>