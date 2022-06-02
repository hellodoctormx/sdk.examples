package com.hellodoctormx.examples.foodpass

import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.tooling.preview.Preview
import androidx.lifecycle.ViewModel
import com.hellodoctormx.examples.foodpass.ui.theme.FoodPassTheme

class HomeScreenViewModel : ViewModel() {

}

@Composable
fun HomeScreen(viewModel: HomeScreenViewModel) {
    FoodPassTheme {
        Text("FoodPass")
    }
}

@Preview(showBackground = true)
@Composable
fun DefaultPreview() {
    HomeScreen(HomeScreenViewModel())
}
