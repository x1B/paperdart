<template>
  <textarea></textarea>
</template>


<script>
import * as CodeMirror from 'codemirror';

export default {
   props: {
      text: {
         type: String,
         'default': ''
      },
      type: {
         type: String,
         default: 'text/plain'
      },
      options: {
         type: Object,
         default: () => ({
            tabSize: 3
         })
      }
   },
   created() {
   },
   mounted() {
      this.cm = CodeMirror.fromTextArea( this.$el, {
         mode: this.type,
         value: this.text,
         ...options
      } );
   }
};
</script>
