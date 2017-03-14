<template>
   <div>
      <h1>Test {{ counter }}</h1>
   </div>
</template>

<script>
export default {
   data:() => { counter: 0 },
   created() {
      console.log( 'created' );
      this.interval = setInterval(() => {
         this.counter++;
      }, 1000);
   },
   destroyed() {
      clearInterval(this.interval);
   }
}
</script>
