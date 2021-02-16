<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.title"
        placeholder="书名"
        style="width:200px"
        class="filter-item"
        clearable
        @clear="handleFilter"
        @keyup.enter.native="handleFilter"
        @blur="handleFilter"
      ></el-input>
      <el-input
        v-model="listQuery.author"
        placeholder="作者"
        style="width:200px"
        class="filter-item"
        clearable
        @clear="handleFilter"
        @keyup.enter.native="handleFilter"
        @blur="handleFilter"
      ></el-input>
      <el-select
        v-model="listQuery.category"
        placeholder="分类"
        clearable
        class="filter-item"
        @clear="handleFilter"
        @change="handleFilter"
      >
        <el-option
          v-for="item in categoryList"
          :label="item.label + '(' + item.num + ')'"
          :value="item.value"
          :key="item.value"
        ></el-option>
      </el-select>
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        style="margin-left:10px"
        @click="handleFilter"
        >查询</el-button
      >
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-edit"
        style="margin-left:5px"
        @click="handleCreate"
        >新增</el-button
      >
      <el-checkbox
        v-model="showCover"
        class="filter-item"
        style="margin-left:5px"
        @change="changeShowCover"
        >显示封面</el-checkbox
      >
    </div>
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      :default-sort="defaultSort"
      border
      fit
      highlight-current-row
      style="width:100%"
      @sort-change="sortChange"
    >
      <el-table-column
        label="ID"
        prop="id"
        sortable="custom"
        align="center"
        width="80px"
      ></el-table-column>
      <el-table-column label="书名" align="center" width="150px">
        <template slot-scope="scope"
          ><span v-html="scope.row.titleWrapper"></span
        ></template>
      </el-table-column>
      <el-table-column label="作者" align="center" width="150px">
        <template slot-scope="scope"
          ><span v-html="scope.row.authorWrapper"></span
        ></template>
      </el-table-column>
      <el-table-column
        label="出版社"
        prop="publisher"
        align="center"
        width="150px"
      >
      </el-table-column>
      <el-table-column
        label="分类"
        prop="categoryText"
        align="center"
        width="150px"
      >
      </el-table-column>
      <el-table-column label="语言" prop="language" align="center">
      </el-table-column>
      <el-table-column
        v-if="showCover"
        label="封面"
        align="center"
        width="135px"
      >
        <template slot-scope="scope"
          ><a :href="scope.row.cover" target="_blank">
            <img :src="scope.row.cover" style="width:120px;height:120px"/></a
        ></template>
      </el-table-column>
      <el-table-column
        label="文件名"
        prop="fileName"
        align="center"
        width="100"
      >
      </el-table-column>
      <el-table-column label="文件路径" align="center" width="100">
        <template slot-scope="scope"
          ><span>{{ scope.row.filePath | valueFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="封面路径"
        prop="coverPath"
        align="center"
        width="100"
      >
        <template slot-scope="scope"
          ><span>{{ scope.row.coverPath | valueFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="解压路径"
        prop="unzipPath"
        align="center"
        width="100"
      >
        <template slot-scope="scope"
          ><span>{{ scope.row.unzipPath | valueFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="上传人"
        prop="createUser"
        align="center"
        width="100"
      >
        <template slot-scope="scope"
          ><span>{{ scope.row.createUser | valueFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="上传时间"
        prop="createDt"
        align="center"
        width="100"
      >
        <template slot-scope="scope"
          ><span>{{ scope.row.createDt | timeFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="120" fixed="right">
        <template slot-scope="scope">
          <el-button
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          ></el-button>
          <el-button
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            style="color:#f56c6c"
          ></el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-if="total > 0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.pageSize"
      @pagination="refresh"
    ></pagination>
  </div>
</template>

<script>
import pagination from "../../components/Pagination";
import waves from "../../directive/waves";
import { getCategory, listBook, deleteBook } from "../../api/book";
import { parseTime } from "@/utils";

export default {
  components: {
    pagination
  },
  directives: {
    waves
  },
  filters: {
    valueFilter(value) {
      return value || "无";
    },
    timeFilter(time) {
      return time ? parseTime(time) : "无";
    }
  },
  data() {
    return {
      defaultSort: {},
      listLoading: true,
      tableKey: 0,
      listQuery: {},
      showCover: false,
      categoryList: [],
      list: [],
      total: 0
    };
  },
  created() {
    this.parseQuery();
  },
  beforeRouteUpdate(to, from, next) {
    if (to.path == from.path) {
      const newQuery = Object.assign({}, to.query);
      const oldQuery = Object.assign({}, from.query);
      if (JSON.stringify(newQuery) !== JSON.stringify(oldQuery)) {
        this.getList();
      }
    }
    next();
  },
  mounted() {
    this.getList();
    this.getCategoryList();
  },
  methods: {
    parseQuery() {
      const query = Object.assign({}, this.$route.query);
      let sort = "+id";
      let listQuery = {
        page: 1,
        pageSize: 20,
        sort: "+id"
      };
      if (query) {
        query.page && (query.page = +query.page);
        query.pageSize && (query.pageSize = +query.pageSize);
        query.sort && (sort = query.sort);
      }
      const symbol = sort[0];
      const column = sort.slice(1, sort.length);
      console.log(symbol, column, "hhhhhh");
      this.defaultSort = {
        prop: column,
        order: symbol == "+" ? "ascending" : "descending"
      };
      this.listQuery = { ...listQuery, ...query, ...this.listQuery };
      // this.getList();
      console.log(this.listQuery, "111111");
    },
    sortChange(data) {
      // console.log(data);
      const { prop, order } = data;
      this.sortBy(prop, order);
    },
    sortBy(prop, order) {
      if (order === "ascending") {
        this.listQuery.sort = `+${prop}`;
      } else {
        this.listQuery.sort = `-${prop}`;
      }
      this.handleFilter();
    },
    refresh() {
      console.log("listQuery", this.listQuery);
      this.$router.push({
        path: "/book/list",
        query: this.listQuery
      });

      // this.getList();
    },
    handleFilter() {
      this.listQuery.page = 1;
      this.refresh();
      // this.getList();
    },
    handleCreate() {
      this.$router.push("/book/create");
    },
    handleUpdate(data) {
      this.$router.push(`/book/edit/${data.fileName}`);
    },
    handleDelete(data) {
      this.$confirm("此操作将永久删除此电子书，是否继续？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          deleteBook(data.fileName).then(res => {
            this.$notify({
              title: "成功",
              message: res.msg || "删除成功",
              type: "success",
              duration: 2000
            });
            this.handleFilter();
          });
        })
        .catch();
    },
    changeShowCover(value) {
      this.showCover = value;
    },
    getCategoryList() {
      getCategory().then(res => {
        this.categoryList = res.data;
      });
    },
    wrapperKeywork(k, v) {
      function highlight(value) {
        // console.log(value, "hhhhh");
        return `<span style="color:#1890ff">${value}</span>`;
      }
      if (!this.listQuery[k]) {
        return v;
      } else {
        return v.replace(new RegExp(this.listQuery[k], "ig"), v =>
          highlight(v)
        );
      }
    },
    getList() {
      this.listLoading = true;
      console.log(this.listQuery, 2222);
      listBook(this.listQuery).then(res => {
        const { list, count } = res.data;
        this.list = list;
        this.total = count;
        this.listLoading = false;
        this.list.forEach(item => {
          item.titleWrapper = this.wrapperKeywork("title", item.title);
          item.authorWrapper = this.wrapperKeywork("author", item.author);
        });
      });
    }
  }
};
</script>

<style></style>
