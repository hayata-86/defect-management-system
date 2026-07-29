import AddIcon from "@mui/icons-material/Add";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import type {
  ChangeEvent,
  MouseEvent,
} from "react";
import {
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import {
  DefectSearchForm,
  DefectTable,
} from "../../components/defects";
import { getDefects } from "../../services/defectService";
import type {
  DefectSearchConditions,
} from "../../types/defect";

const initialSearchConditions: DefectSearchConditions = {
  keyword: "",
  projectName: "",
  status: "",
  priority: "",
  assignee: "",
};

export function DefectListPage() {
  const navigate = useNavigate();

  /**
   * TanStack Queryで不具合一覧を取得する
   */
  const {
    data: defects = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["defects"],
    queryFn: getDefects,
  });

  /**
   * 検索フォームに入力されている値
   */
  const [
    inputSearchConditions,
    setInputSearchConditions,
  ] = useState<DefectSearchConditions>(
    initialSearchConditions,
  );

  /**
   * 実際に一覧の絞り込みに使用する検索条件
   */
  const [
    appliedSearchConditions,
    setAppliedSearchConditions,
  ] = useState<DefectSearchConditions>(
    initialSearchConditions,
  );

  /**
   * ページング
   */
  const [page, setPage] = useState(0);

  const [rowsPerPage, setRowsPerPage] =
    useState(10);

  /**
   * 検索フォームの入力値を変更する
   */
  const handleSearchConditionsChange = (
    conditions: DefectSearchConditions,
  ) => {
    setInputSearchConditions(conditions);
  };

  /**
   * 検索を実行する
   */
  const handleSearch = () => {
    setAppliedSearchConditions(
      inputSearchConditions,
    );

    setPage(0);
  };

  /**
   * 検索条件をクリアする
   */
  const handleClear = () => {
    setInputSearchConditions(
      initialSearchConditions,
    );

    setAppliedSearchConditions(
      initialSearchConditions,
    );

    setPage(0);
  };

  /**
   * 不具合一覧を再取得する
   */
  const handleReload = () => {
    void refetch();
  };

  /**
   * 新規登録画面へ遷移する
   */
  const handleCreate = () => {
    navigate("/defects/new");
  };

  /**
   * ページを変更する
   */
  const handlePageChange = (
    _event:
      | MouseEvent<HTMLButtonElement>
      | null,
    newPage: number,
  ) => {
    setPage(newPage);
  };

  /**
   * 1ページ当たりの表示件数を変更する
   */
  const handleRowsPerPageChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(
      Number(event.target.value),
    );

    setPage(0);
  };

  /**
   * 検索条件に一致する不具合を抽出する
   */
  const filteredDefects = useMemo(() => {
    const normalizedKeyword =
      appliedSearchConditions.keyword
        .trim()
        .toLowerCase();

    return defects.filter((defect) => {
      const matchesKeyword =
        normalizedKeyword === "" ||
        defect.id
          .toLowerCase()
          .includes(normalizedKeyword) ||
        defect.title
          .toLowerCase()
          .includes(normalizedKeyword) ||
        defect.projectName
          .toLowerCase()
          .includes(normalizedKeyword) ||
        defect.assignee
          .toLowerCase()
          .includes(normalizedKeyword) ||
        defect.description
          .toLowerCase()
          .includes(normalizedKeyword);

      const matchesStatus =
        appliedSearchConditions.status === "" ||
        defect.status ===
          appliedSearchConditions.status;

      const matchesPriority =
        appliedSearchConditions.priority === "" ||
        defect.priority ===
          appliedSearchConditions.priority;

      const matchesAssignee =
        appliedSearchConditions.assignee === "" ||
        defect.assignee ===
          appliedSearchConditions.assignee;

      return (
        matchesKeyword &&
        matchesStatus &&
        matchesPriority &&
        matchesAssignee
      );
    });
  }, [
    defects,
    appliedSearchConditions,
  ]);

  /**
   * 現在のページに表示する不具合を抽出する
   */
  const displayedDefects = useMemo(() => {
    const startIndex =
      page * rowsPerPage;

    const endIndex =
      startIndex + rowsPerPage;

    return filteredDefects.slice(
      startIndex,
      endIndex,
    );
  }, [
    filteredDefects,
    page,
    rowsPerPage,
  ]);

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: {
            xs: "flex-start",
            sm: "center",
          },
          justifyContent: "space-between",
          flexDirection: {
            xs: "column",
            sm: "row",
          },
          gap: 2,
          marginBottom: 3,
        }}
      >
        <Box>
          <Typography
            variant="h3"
            component="h1"
          >
            不具合一覧
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ marginTop: 0.5 }}
          >
            登録されている不具合の検索・確認を行います。
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 1.5,
          }}
        >
          <Button
            variant="outlined"
            onClick={handleReload}
            disabled={isFetching}
          >
            {isFetching
              ? "再読み込み中..."
              : "再読み込み"}
          </Button>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
          >
            新規登録
          </Button>
        </Box>
      </Box>

      <DefectSearchForm
        conditions={
          inputSearchConditions
        }
        onChange={
          handleSearchConditionsChange
        }
        onSearch={handleSearch}
        onClear={handleClear}
      />

      <Box sx={{ marginTop: 3 }}>
        {isError && (
          <Alert
            severity="error"
            sx={{ marginBottom: 2 }}
          >
            不具合一覧の取得に失敗しました。
            json-serverが起動しているか確認してください。
          </Alert>
        )}

        {isLoading ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 300,
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box
              sx={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                marginBottom: 1.5,
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
              >
                検索結果：
                {filteredDefects.length}
                件
              </Typography>

              {isFetching && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  データを更新しています...
                </Typography>
              )}
            </Box>

            <DefectTable
              defects={displayedDefects}
              page={page}
              rowsPerPage={rowsPerPage}
              totalCount={
                filteredDefects.length
              }
              onPageChange={
                handlePageChange
              }
              onRowsPerPageChange={
                handleRowsPerPageChange
              }
            />
          </>
        )}
      </Box>
    </Box>
  );
}

export default DefectListPage;