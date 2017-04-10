<template>
   <div>
      <h5>Type: {{ paste.type }}</h5>
      <codemirror-control :text="paste.content" />
   </div>
</template>

<script>
export default {
   data: () => ({
      paste: {
         content: 'Hallo',
         type: 'text/plain'
      }
   }),
   created() {
   },
   destroyed() {
   }
}
</script>
