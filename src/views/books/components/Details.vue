<template>
  <div>
    <el-form
      ref="postForm"
      :model="postForm"
      class="form-container"
      :rules="rules"
    >
      <sticky :class-name="'sub-navbar'">
        <el-button v-if="!isEdit" @click="showGuide">显示帮助</el-button>
        <el-button
          style="margin-left:10px"
          v-loading="loading"
          type="success"
          @click="submitForm"
          >{{ isEdit ? "编辑电子书" : "新增电子书" }}</el-button
        >
      </sticky>
      <div class="detail-container">
        <el-row>
          <warning />
          <el-col :span="24">
            <ebook-upload
              :file-list="fileList"
              :disabled="isEdit"
              @onSuccess="onSuccess"
              @onRemove="onRemove"
            ></ebook-upload>
          </el-col>
          <el-col :span="24">
            <el-form-item prop="title">
              <MDinput
                v-model="postForm.title"
                :maxlength="100"
                name="name"
                required
              >
                书名</MDinput
              >
            </el-form-item>
            <el-row>
              <el-col :span="12">
                <el-form-item
                  label="作者"
                  prop="author"
                  :label-width="labelwidth"
                >
                  <el-input
                    v-model="postForm.author"
                    placeholder="作者"
                  ></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item
                  label="出版社"
                  prop="publisher"
                  :label-width="labelwidth"
                >
                  <el-input
                    v-model="postForm.publisher"
                    placeholder="出版社"
                  ></el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item
                  label="语言"
                  prop="language"
                  :label-width="labelwidth"
                >
                  <el-input
                    v-model="postForm.language"
                    placeholder="语言"
                  ></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item
                  label="根文件"
                  prop="rootFile"
                  :label-width="labelwidth"
                >
                  <el-input
                    v-model="postForm.rootFile"
                    placeholder="根文件"
                    disabled
                  ></el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item
                  label="文件路径"
                  prop="filePath"
                  :label-width="labelwidth"
                >
                  <el-input
                    v-model="postForm.filePath"
                    placeholder="文件路径"
                    disabled
                  ></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item
                  label="解压路径"
                  prop="unzipPath"
                  :label-width="labelwidth"
                >
                  <el-input
                    v-model="postForm.unzipPath"
                    placeholder="解压路径"
                    disabled
                  ></el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item
                  :label-width="labelwidth"
                  prop="coverPath"
                  label="封面路径："
                >
                  <el-input
                    v-model="postForm.coverPath"
                    placeholder="封面路径"
                    style="width: 100%"
                    disabled
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item
                  :label-width="labelwidth"
                  prop="fileName"
                  label="文件名称："
                >
                  <el-input
                    v-model="postForm.fileName"
                    placeholder="文件名称"
                    style="width: 100%"
                    disabled
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item
                  label="封面"
                  prop="cover"
                  :label-width="labelwidth"
                >
                  <a
                    v-if="postForm.cover"
                    href="postForm.cover"
                    target="_blank"
                  >
                    <img :src="postForm.cover" class="previewImg"
                  /></a>
                  <span v-else>无</span>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item
                  label="目录"
                  prop="contentsTree"
                  :label-width="labelwidth"
                >
                  <div
                    v-if="
                      postForm.contentsTree && postForm.contentsTree.length > 0
                    "
                    class="contents-wrapper"
                  >
                    <el-tree
                      :data="contentsTree"
                      @node-click="onContentClick"
                    ></el-tree>
                  </div>
                  <span v-else>无</span>
                </el-form-item>
              </el-col>
            </el-row>
          </el-col>
        </el-row>
      </div>
    </el-form>
  </div>
</template>

<script>
import Sticky from "../../../components/Sticky/index";
import MDinput from "../../../components/MDinput";
import EbookUpload from "../../../components/Ebookupload/index";
import warning from "./warning";
import { createBook, getBook, updataBook } from "../../../api/book";
// import { title } from "@/settings";
const defaultForm = {
  title: "",
  author: "",
  publisher: "",
  language: "",
  rootFile: "",
  cover: "",
  url: "",
  originalName: "",
  contents: "",
  fileName: "",
  coverPath: "",
  filePath: "",
  unzipPath: ""
};
const fieLds = {
  title: "书名",
  author: "作者",
  publisher: "出版社",
  language: "语言"
};
export default {
  components: {
    Sticky,
    MDinput,
    warning,
    EbookUpload
  },
  props: {
    isEdit: Boolean
  },
  data() {
    const validateRequire = (rule, value, callback) => {
      if (!value) {
        callback(new Error(fieLds[rule.field] + "必须填写"));
      } else {
        callback();
      }
    };
    return {
      fileList: [],
      loading: false,
      postForm: {},
      labelwidth: "120px",
      contentsTree: [],
      rules: {
        title: [{ validator: validateRequire }],
        author: [{ validator: validateRequire }],
        publisher: [{ validator: validateRequire }],
        language: [{ validator: validateRequire }]
      }
    };
  },
  created() {
    if (this.isEdit) {
      console.log(this.$route.params);
      const fileName = this.$route.params.fileName;
      this.getBookData(fileName);
    }
  },
  methods: {
    getBookData(fileName) {
      getBook(fileName).then(book => {
        this.setData(book.data.book);
      });
    },
    onContentClick(data) {
      console.log(data);
      if (data.text) {
        window.open(data.text);
      }
    },
    setData(data) {
      const {
        title,
        author,
        publisher,
        language,
        rootFile,
        cover,
        url,
        originalName,
        contentsTree,
        contents,
        fileName,
        coverPath,
        filePath,
        unzipPath
      } = data;
      this.postForm = {
        ...this.postForm,
        title,
        author,
        publisher,
        language,
        rootFile,
        contentsTree,
        cover,
        url,
        originalName,
        contents,
        fileName,
        coverPath,
        filePath,
        unzipPath
      };
      this.contentsTree = contentsTree;
      this.fileList = [{ name: originalName || fileName, url }];
    },
    setDefault() {
      // this.postForm = Object.assign({}, defaultForm);
      this.contentsTree = [];
      this.fileList = [];
      this.$refs.postForm.resetFields();
    },
    submitForm() {
      // if (!this.loading) {
      if (true) {
        this.loading = true;
        this.$refs.postForm.validate((valid, fieLds) => {
          console.log(valid, fieLds, 111111);
          if (valid) {
            console.log(this.postForm);
            const book = Object.assign({}, this.postForm);
            // delete book.contents;
            delete book.contentsTree;
            if (!this.isEdit) {
              createBook(book)
                .then(res => {
                  const { msg } = res;
                  this.$notify({
                    title: "操作成功",
                    message: msg,
                    type: "success",
                    duration: 2000
                  });
                  this.loading = false;
                  this.setDefault();
                })
                .catch(() => {
                  this.loading = false;
                });
            } else {
              // delete book.contentsTree;
              updataBook(book).then(res => {
                const { msg } = res;
                this.$notify({
                  title: "操作成功",
                  message: msg,
                  type: "success",
                  duration: 2000
                });
                this.loading = false;
              });
            }
          } else {
            const message = fieLds[Object.keys(fieLds)[0]][0].message;
            this.$message({
              message: message,
              type: "error"
            });
            this.loading = false;
          }
        });
      }
    },
    showGuide() {
      console.log("show guide");
    },
    onSuccess(data) {
      console.log(data, 11111);
      this.setData(data);
      console.log("onSuccess");
    },
    onRemove() {
      this.setDefault();
      console.log("onRemove");
    }
  }
};
</script>

<style lang="scss" scoped>
@import "~@/styles/mixin.scss";

.detail {
  position: relative;
  .detail-container {
    padding: 40px 45px 20px 50px;
    .preview-img {
      width: 200px;
      height: 270px;
    }
    .contents-wrapper {
      padding: 5px 0;
    }
  }
}
.preview-img {
  width: 200px;
  height: 270px;
}
.contents-wrapper {
}
</style>
